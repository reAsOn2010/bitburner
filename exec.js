/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    let ram = ns.getScriptRam("gao.js")
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
            let max_ram = ns.getServerMaxRam(h)
            let count = max_ram / ram
            let connected = ns.scan(h).filter(it => it != "home" && ns.hasRootAccess(it) && ns.getServerMaxMoney(it) > 0)
            ns.tprint("host:", h, " target:", connected, " count:", count)
            for (let j = 0; j < Math.min(count, connected.length); j++) {
                ns.exec("gao.js", h, 1, 1, connected[j])
            }
            hosts.push(h)
        }
    }
}