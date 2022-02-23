import { getHosts } from "./lib"

/** @param {import(".").NS } ns */
export async function main(ns) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it) && ns.getServerRequiredHackingLevel(it) < ns.getHackingLevel() + 1 && ns.getHackTime(it) < 10 * 1000 * 60 && it != "home")
    for (const host of hosts) {
        await HWGW(ns, host, 1)
    }
}

function normalize(t) {
    return Math.ceil(t / 20) * 20
}

/** @param {import(".").NS } ns */
async function HWGW(ns, host, threads) {
    let hack_time = normalize(ns.getHackTime(host))
    let grow_time = normalize(ns.getGrowTime(host))
    let weaken_time = normalize(ns.getWeakenTime(host))
    let loop = Math.ceil(Math.max(hack_time, grow_time, weaken_time))
    let h_sleep = loop - hack_time
    let w1_sleep = loop + 200 - weaken_time
    let g_sleep = loop + 400 - grow_time
    let w2_sleep = loop + 600 - weaken_time
    let growth = ns.getServerGrowth(host)
    let g_th = threads * Math.ceil(100 / growth)

    let money = ns.getServerMoneyAvailable(host) / ns.getServerMaxMoney(host) * 100
    let security = ns.getServerSecurityLevel(host) / ns.getServerMinSecurityLevel(host) * 100

    if (money < 100) {
        ns.exec("grow.js", "home", 100, host, 0)
        await ns.sleep(grow_time + 100)
    } else if (security > 100) {
        ns.exec("weaken.js", "home", 100, host, 0)
        await ns.sleep(weaken_time + 100)
    }

    ns.tprint(host, "|", money.toFixed(2), "|", security.toFixed(2))
    ns.exec("hack.js", "home", threads, host, h_sleep)
    ns.exec("weaken.js", "home", threads, host, w1_sleep)
    ns.exec("grow.js", "home", g_th, host, g_sleep)
    ns.exec("weaken.js", "home", threads, host, w2_sleep)
    await ns.sleep(loop + 700)

    money = ns.getServerMoneyAvailable(host) / ns.getServerMaxMoney(host) * 100
    security = ns.getServerSecurityLevel(host) / ns.getServerMinSecurityLevel(host) * 100
    ns.tprint(host, "|", money.toFixed(2), "|", security.toFixed(2))
}

/** @param {import(".").NS } ns */
function printInfo(ns, host) {

    
    if (money < 100) {
        ns.exec("grow.js", "home", 500, host, 0)
    } else if (security > 100) {
        ns.exec("weaken.js", "home", 500, host, 0)
    }
}