/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    let tools = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"]
    while (true) {
        if (i >= hosts.length) {
            break
        }
        let host = hosts[i++]
        let results = ns.scan(host)
        for (const h of results) {
            if (hosts.includes(h)) {
                continue
            }
            for (let j = 0; j < tools.length; j++) {
                if (!ns.fileExists(tools[j], "home")) {
                    continue
                }
                if (j === 0) { ns.brutessh(h) }
                if (j === 1) { ns.ftpcrack(h) }
                if (j === 2) { ns.relaysmtp(h) }
                if (j === 3) { ns.httpworm(h) }
                if (j === 4) { ns.sqlinject(h) }
            }
            try {
                ns.nuke(h)
                // ns.installBackdoor(h)
            } catch (e) {
                ns.tprint("host:", h, ",", e)
            }
            hosts.push(h)
        }
    }
}