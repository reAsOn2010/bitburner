import { getLoopTime, calcHWGWThreads, getCycleRam, requestRam, maxBase } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let target = ns.args[0]
    let skip_prepare = Boolean(ns.args[1])
    let id = 0
    while (!skip_prepare && ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        for (let base = maxBase(); base > 0; base--) {
            let host = requestRam(ns, base * ns.getScriptRam("grow.js"))
            if (host != null) {
                ns.exec("grow.js", host, base, target, 0, id++)
                break
            }
        }
        for (let base = maxBase(); base > 0; base--) {
            let host = requestRam(ns, base * ns.getScriptRam("weaken.js"))
            if (host != null) {
                ns.exec("weaken.js", host, base, target, 0, id++)
                break
            }
        }
        await ns.sleep(getLoopTime())
    }
    while (!skip_prepare && ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        for (let base = maxBase(); base > 0; base--) {
            let host = requestRam(ns, ns.getScriptRam("weaken.js"))
            if (host != null) {
                ns.exec("weaken.js", host, base, target, 0, id++)
                break
            }
        }
        await ns.sleep(getLoopTime())
    }
    while (true) {
        if (id % 600 == 0) {
            let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
            let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
            ns.tprint(target, "|", money.toFixed(2), "|", security.toFixed(2))
        }
        HWGW(ns, target, id++)
        await ns.sleep(getLoopTime())
    }
}

function normalize(t) {
    return Math.ceil(t / 20) * 20
}

/** @param {import(".").NS } ns */
async function HWGW(ns, target, id) {
    let hack_time = normalize(ns.getHackTime(target))
    let grow_time = normalize(ns.getGrowTime(target))
    let weaken_time = normalize(ns.getWeakenTime(target))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))

    let h_sleep = loop - hack_time + getLoopTime() / 4 * 0
    let w1_sleep = loop - weaken_time + getLoopTime() / 4
    let g_sleep = loop - grow_time + getLoopTime() / 4 * 2
    let w2_sleep = loop - weaken_time + getLoopTime() / 4 * 3
    let host = null
    let ts = null
    for (let base = maxBase(); base > 0; base--) {
        let tmp_ts = calcHWGWThreads(ns, target, base)
        let cycle_ram = getCycleRam(ns, tmp_ts)
        let tmp_host = requestRam(ns, cycle_ram)
        if (tmp_host == null) {
            continue
        } else {
            host = tmp_host
            ts = tmp_ts
            break
        }
    }
    if (host == null) {
        return
    }
    // ns.tprint(host, ts)
    // let money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // let security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))

    ns.exec("hack.js", host, ts[0], target, h_sleep, id)
    ns.exec("weaken.js", host, ts[1], target, w1_sleep, id)
    ns.exec("grow.js", host, ts[2], target, g_sleep, id)
    ns.exec("weaken.js", host, ts[3], target, w2_sleep, id)
    // await ns.sleep(loop + 700)

    // money = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) * 100
    // security = ns.getServerSecurityLevel(target) / ns.getServerMinSecurityLevel(target) * 100
    // ns.tprint(host, "|", target, "|", money.toFixed(2), "|", security.toFixed(2))
    // return ts + 800
}