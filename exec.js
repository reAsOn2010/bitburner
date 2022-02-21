import * as lib from "./lib.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = lib.getHosts(ns)
    // let ram = ns.getScriptRam("gao.js")
    let ram = ns.getScriptRam("grow.js")
    let count = 0
    // let duplicator = 5
    let servers = hosts.filter(it => ns.hasRootAccess(it))
    servers.push("home")
    for (const h of servers) {
        let max_ram = lib.getHostAvailableRam(ns, h)
        count += Math.floor(max_ram / ram)
    }
    let targets = lib.calcResource(ns, count)
    for (const h of servers) {
        let max_ram = lib.getHostAvailableRam(ns, h)
        let capacity = Math.floor(max_ram / ram)
        let args = []
        while (capacity > 0) {
            let target = Object.keys(targets)[0]
            if (target == null) {       
                break
            }
            let needed = targets[target]
            let _t = 0
            if (needed > capacity) {
                _t = capacity
                targets[target] = needed - capacity
                capacity = 0
            } else if (needed <= capacity) {
                _t = needed
                capacity -= needed
                delete targets[target]
            }
            ns.tprint("from:", h, "|", "to:", target, "|", "replicas:", _t)
            args.push(target+"="+_t)
            // let random = Math.random() * 1000
            // let init_sleep = lib.calcInitSleep(ns, target, _t)
            // init_sleep = 
            // for (let i = _t; i > 0; i -= duplicator) {
            //     if (i < duplicator) {
            //         ns.exec("gao.js", h, i, target, Math.random() * 1000 * 60, ns.getServerMinSecurityLevel(target), ns.getServerMaxMoney(target))
            //     } else {
            //         ns.exec("gao.js", h, duplicator, target, Math.random() * 1000 * 60, ns.getServerMinSecurityLevel(target), ns.getServerMaxMoney(target))
            //     }
            // }
        }
        ns.exec("agent.js", h, 1, ...args)
    }
}