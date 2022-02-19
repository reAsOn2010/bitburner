/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    let ram = ns.getScriptRam("gao.js")
    let count = 0
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
            hosts.push(h)
        }
    }
    for (const h of hosts) {
        let max_ram = ns.getServerMaxRam(h)
        count += Math.floor(max_ram / ram)
    }
    let servers = hosts.filter(it => it != "home" && ns.hasRootAccess(it))
    let targets = hosts.filter(it => it != "home" && ns.hasRootAccess(it) && ns.getServerMaxMoney(it) > 0)
    let threads = Math.floor(count / targets.length)
    let remains = count % targets.length
    let t_map = {}
    for (let j = 0; j < targets.length; j++) {
        if (j < remains) {
            t_map[targets[j]] = threads + 1
        } else {
            t_map[targets[j]] = threads
        }
    }
    for (const s of servers) {
        let capacity = Math.floor(ns.getServerMaxRam(s) / ram)
        while (capacity > 0) {
            let target = Object.keys(t_map)[0]
            let needed = t_map[target]
            let _t = 0
            if (needed > capacity) {
                _t = capacity
                t_map[target] = needed - capacity
                capacity = 0
            } else if (needed <= capacity) {
                _t = needed
                capacity -= needed
                delete t_map[target]
            }
            ns.tprint("from:", s, "|", "to:", target, "|", "threads:", _t)
            ns.exec("gao.js", s, _t, 1, target)
        }
    }
}