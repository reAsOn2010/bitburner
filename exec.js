/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    let ram = ns.getScriptRam("gao.js")
    if (ns.args[0] == "kube") {
        let results = ns.scan("home").filter(it => it.startsWith("kube"))
        for (const h of results) {
            let max_ram = ns.getServerMaxRam(h)
            let threads = max_ram / ram
            ns.exec("gao.js", h, threads, 1, ns.args[1])
        }
        return
    }
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
                let threads = Math.floor(count) / connected.length
                let remains = Math.floor(count) % connected.length
                if (j < remains) {
                    ns.exec("gao.js", h, threads+1, 1, connected[j])
                } else {
                    ns.exec("gao.js", h, threads, 1, connected[j])
                }
            }
            hosts.push(h)
        }
    }
}