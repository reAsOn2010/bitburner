import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let target = ns.args[0]
    let prepare_limit = args[1]
    await prepare(ns, target, prepare_limit)
    while (true) {
        if (id % 600 == 0) {
            // let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
            // let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
            // ns.tprint(target, "|", money.toFixed(2), "|", security.toFixed(2))
        }
        HWGW(ns, target, id++, loop_time)
        await ns.sleep(loop_time)
    }
}

/** @param {import(".").NS } ns */
async function prepare(ns, target, limit) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        for (const host of hosts) {
            let available_ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
            let t = Math.floor(available_ram / ns.getScriptRam("grow.js"))
            if (t > 0) {
                ns.exec("grow.js", host, t, target, Math.random() * 5000)
            }
        }
        ns.tprint("money", "|", ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target))
        await ns.sleep(60000)
    }
    
    while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        for (const host of hosts) {
            let available_ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
            let t = Math.floor(available_ram / ns.getScriptRam("weaken.js"))
            if (t > 0) {
                ns.exec("weaken.js", host, t, target, Math.random() * 5000)
            }
        }
        ns.tprint("security", "|", ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target))
        await ns.sleep(60000)
    }
}

/** @param {import(".").NS } ns */
async function HWGW(ns, target, id, loop_time) {
    let hack_time = normalize(ns.getHackTime(target))
    let grow_time = normalize(ns.getGrowTime(target))
    let weaken_time = normalize(ns.getWeakenTime(target))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))

    let h_sleep = loop - hack_time + loop_time / 4 * 0
    let w1_sleep = loop - weaken_time + loop_time / 4
    let g_sleep = loop - grow_time + loop_time / 4 * 2
    let w2_sleep = loop - weaken_time + loop_time / 4 * 3

    let t = calcGrowThreads(ns, target)
    let cycle_ram = ns.getScriptRam("hack.js") + 2 * ns.getScriptRam("weaken.js") + t * ns.getScriptRam("grow.js")
    let host = requestRam(ns, cycle_ram)

    if (host == null) {
        return 
    }
    // let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))
    
    ns.exec("hack.js", host, 1, target, h_sleep, id)
    ns.exec("weaken.js", host, 1, target, w1_sleep, id)
    ns.exec("grow.js", host, t, target, g_sleep, id)
    ns.exec("weaken.js", host, 1, target, w2_sleep, id)
    // await ns.sleep(loop + 700)

    // money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))
    // return ts + 800
}