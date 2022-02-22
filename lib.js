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

/** @param {import(".").NS } ns */
export function calcResource(ns, capacity) {
    let resource = {}
    let info = {}
    let reasonable = getHosts(ns).filter(it => ns.hasRootAccess(it) && ns.getServerRequiredHackingLevel(it) < ns.getHackingLevel() + 1)
    let total = 0
    for (const h of reasonable) {
        info[h] = ns.getServerMaxMoney(h) / ns.getServerMinSecurityLevel(h)
        total += info[h]
    }
    for (const h of reasonable) {
        let r = Math.round(info[h] / total * capacity)
        if (r > 0) {
            resource[h] = r
        }
    }
    return resource
}

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
export async function buykubes(ns) {
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
    let max_ram = ns.getServerMaxRam(host) - ns.getScriptRam("agent.js")
    if (host == "home") {
        max_ram = Math.max(0, max_ram - 4 - ns.getScriptRam("all.js") - ns.getScriptRam("agent.js"))
        ns.tprint(max_ram)
    }
    return max_ram
}