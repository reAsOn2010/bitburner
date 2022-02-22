import {getHosts, getHostAvailableRam, calcResource} from "./lib.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns)
    let ram = ns.getScriptRam("grow.js")
    let count = 0
    let servers = hosts.filter(it => ns.hasRootAccess(it))
    for (const from of servers) {
        let max_ram = getHostAvailableRam(ns, from)
        count += Math.floor(max_ram / ram)
    }
    let targets = calcResource(ns, count)
    let args = []
    for (const from of servers) {
        let max_ram = getHostAvailableRam(ns, from)
        let capacity = Math.floor(max_ram / ram)
        while (capacity > 0) {
            let to = Object.keys(targets)[0]
            if (to == null) {       
                break
            }
            let needed = targets[to]
            let replicas = 0
            if (needed > capacity) {
                replicas = capacity
                targets[to] = needed - capacity
                capacity = 0
            } else if (needed <= capacity) {
                replicas = needed
                capacity -= needed
                delete targets[to]
            }
            ns.tprint("from:", from, "|", "to:", to, "|", "replicas:", replicas, "|", "total:", replicas * ns.getScriptRam("grow.js"), "|" , "capacity:", capacity)
            args.push(from+"="+to+"="+replicas)
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
    }
    ns.exec("agent.js", "home", 1, ...args)
}