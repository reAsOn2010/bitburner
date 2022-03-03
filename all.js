import { buykubes, buynodes, getHosts, getLoopTime, rootAll, scpAll, calcScore } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("ALL")
    ns.tprint(ns.args[0])
    let delay = 2 * 60 * 60
    if (ns.args[0] == "quick")
        delay = 2 * 60 * 10
    let pids = {}
    let count = 0
    while (true) {
        if (count % delay == 0) {
            rootAll(ns)
            ns.print("buy kubes...")
            buykubes(ns)
            await scpAll(ns)
            ns.print("reload hwgw...")
            killHWGW(ns, pids)
            pids = runHWGW(ns, pids)
        }
        if (count % 1 == 0) { 
            // ns.print("buy nodes...")
            buynodes(ns)
        }
        count++
        await ns.sleep(500)
    }
}

/** @param {import(".").NS } ns */
function killHWGW(ns, pids) {
    for (const pid of Object.values(pids)) {
        ns.kill(pid)
    }
}

/** @param {import(".").NS } ns */
export function runHWGW(ns, origin_pids={}) {
    let scores = calcScore(ns, getLoopTime())
    scores.sort((a, b) => {
        if (a[1] > b[1]) return -1
        else if (a[1] < b[1]) return 1
        else return 0
    })
    let total_ram = getTotalRam(ns) - 8
    ns.tprint(origin_pids)
    let pids = {}
    for (const info of scores) {
        ns.tprint(info)
        let target = info[0]
        let cycles_per_loop = info[2]
        let loop_ram = info[3]
        total_ram -= Math.floor(cycles_per_loop) * Math.floor(loop_ram)
        if (total_ram < 0 && Object.keys(pids).length > 0) {
            break
        }
        let skip_prepare = false
        if (ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) > 0.9 && 
                ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) < 1.1) {
            skip_prepare = true
        }
        let pid = ns.exec("hwgw.js", "home", 1, target, skip_prepare)
        pids[target] = pid
        if (Object.keys(pids).length > 9) {
            break
        }
    }
    return pids
}

/** @param {import(".").NS } ns */
function getTotalRam(ns) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    let total_ram = 0
    for (const host of hosts) {
        total_ram += ns.getServerMaxRam(host)
    }
    return total_ram
}