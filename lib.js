/** @param {import(".").NS } ns */
export function getHosts(ns) {
    let hosts = ["home"]
    let i = 0
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
    return hosts
}

// /** @param {import(".").NS } ns */
// export function calcResource(ns, capacity) {
//     let resource = {}
//     let info = {}
//     let reasonable = getHosts(ns).filter(it => ns.hasRootAccess(it) && ns.getServerRequiredHackingLevel(it) < ns.getHackingLevel() + 1)
//     let total = 0
//     for (const h of reasonable) {
//         info[h] = ns.getServerMaxMoney(h) / ns.getServerMinSecurityLevel(h)
//         total += info[h]
//     }
//     for (const h of reasonable) {
//         let r = Math.round(info[h] / total * capacity)
//         if (r > 0) {
//             resource[h] = r
//         }
//     }
//     return resource
// }

/** @param {import(".").NS } ns */
export function buynodes(ns) {
    let threshold = ns.getServerMoneyAvailable("home") / 10
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        if (ns.hacknet.getLevelUpgradeCost(i, 1) < threshold) {
            ns.hacknet.upgradeLevel(i, 1)
            break
        }
        if (ns.hacknet.getCacheUpgradeCost(i, 1) < threshold) {
            ns.hacknet.upgradeCache(i, 1)
            break
        }
        if (ns.hacknet.getRamUpgradeCost(i, 1) < threshold) {
            ns.hacknet.upgradeRam(i, 1)
            break
        }
        if (ns.hacknet.getCoreUpgradeCost(i, 1) < threshold) {
            ns.hacknet.upgradeCore(i, 1)
            break
        }
    }
    if (ns.hacknet.getPurchaseNodeCost() < threshold) {
        ns.hacknet.purchaseNode()
    }
}

/** @param {import(".").NS } ns */
export function buykubes(ns) {
    let currentRam = 2
    let threshold = ns.getServerMoneyAvailable("home") / 2
    if (ns.serverExists("kube-0")) {
        currentRam = ns.getServerMaxRam("kube-0")
    }
    let limit = ns.getPurchasedServerLimit()
    for (let nextRam = Math.pow(2,  20); nextRam > currentRam; nextRam = nextRam / 2) {
        let cost = ns.getPurchasedServerCost(nextRam) * limit
        ns.print("nextRam:",nextRam,"|","cost:",cost)
        if (cost < threshold) {
            stopScriptsAllServer(ns, limit)
            deleteAllServer(ns, limit)
            purchaseAllServer(ns, limit, nextRam)
            return true
        }
    }
    return false
}

/** @param {import(".").NS } ns */
function stopScriptsAllServer(ns, limit) {
    for (let i = 0; i < limit; i++) {
        if (ns.serverExists("kube-" + i)) {
            ns.killall("kube-" + i)
        }
    }
}

/** @param {import(".").NS } ns */
function deleteAllServer(ns, limit) {
    for (let i = 0; i < limit; i++) {
        ns.deleteServer("kube-" + i)
    }
}

/** @param {import(".").NS } ns */
function purchaseAllServer(ns, limit, ram) {
    for (let i = 0; i < limit; i++) {
        ns.purchaseServer("kube-" + i, ram)
    }
}

/** @param {import(".").NS } ns */
export function getHostAvailableRam(ns, host) {
    let max_ram = ns.getServerMaxRam(host)
    if (host == "home") {
        max_ram = Math.max(0, max_ram - 2*ns.getScriptRam("all.js") - 2*ns.getScriptRam("agent.js"))
    }
    return max_ram
}

/** @param {import(".").NS } ns */
export async function scpAll(ns) {
    let hosts = getHosts(ns)
    let files = ns.ls("home", ".js")
    for (const h of hosts.filter(it => it != "home")) {
        await ns.scp(files, h)
    }
}

/** @param {import(".").NS } ns */
export function rootAll(ns) {
    let hosts = getHosts(ns)
    let tools = ["brutessh.exe", "ftpcrack.exe", "relaysmtp.exe", "httpworm.exe", "sqlinject.exe"]
    for (const h of hosts) {
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
            ns.tprint("host:", h, "|", "root failed.")
        }
    }
}

export function getLoopTime() {
    return 1200
}

/** @param {import(".").NS } ns */
export function calcHWGWThreads(ns, target, base=1) {
    let h = base
    let w1 = Math.ceil(0.002 * h / 0.05)
    let g = calcGrowThreads(ns, target, base)
    let w2 = Math.ceil(0.004 * g / 0.05)
    return [h, w1, g, w2]
}

export function getCycleRam(ns, ts) {
    let cycle_ram = ns.getScriptRam("hack.js") * ts[0] +
        ns.getScriptRam("weaken.js") * (ts[1] + ts[3]) +
        ns.getScriptRam("grow.js") * ts[2]
    return cycle_ram
}

import * as formula from "./formula.js"

/** @param {import(".").NS } ns */
export function calcGrowThreads(ns, target, base=1) {
    let player = ns.getPlayer()
    let server = ns.getServer(target)
    let t = 1
    for (t = 1; t < 100; t++) {
        if ((1 - formula.hackPercent(ns, server, player) * base) * formula.growPercent(ns, server, t, player) >= 1) {
            break
        }
    }
    return t
}

/** @param {import(".").NS } ns */
export function requestRam(ns, ram) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it))
    for (const host of hosts) {
        if (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) > ram) {
            return host
        }
    }
    return null
}

/** @param {import(".").NS } ns */
export function calcScore(ns) {
    let hosts = getHosts(ns).filter(it => ns.hasRootAccess(it) && ns.getServerRequiredHackingLevel(it) <= ns.getHackingLevel())
    let scores = []
    for (const host of hosts) {
        let server = ns.getServer(host)
        let player = ns.getPlayer()
        let t = calcGrowThreads(ns, host)
        let loop_ram = ns.getScriptRam("hack.js") + 2 * ns.getScriptRam("weaken.js") + t * ns.getScriptRam("grow.js")
        // let count = total_ram / cycle_ram
        let cycles_per_loop = Math.max(
            formula.growTime(ns, server, player),
            formula.hackTime(ns, server, player),
            formula.weakenTime(ns, server, player)
        ) / getLoopTime()
        let score = ns.getServerMaxMoney(host) * formula.hackPercent(ns, server, player) * formula.hackChance(ns, server, player) * cycles_per_loop
        // ns.tprint(ns.getServerMaxMoney(host), "|", formula.hackPercent(ns, server, player), "|", formula.hackChance(ns, server, player))
        // ns.tprint(host, "|", score, "|", cycles_per_loop, "|", loop_ram)
        if (score > 0) {
            scores.push([host, score, cycles_per_loop, loop_ram])
        }
    }
    return scores
}