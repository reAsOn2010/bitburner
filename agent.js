/** @param {import(".").NS } ns */
export async function main(ns) {
    let meta = buildMeta(ns)
    let current = ns.getHostname()
    let limit = Math.round(Math.log2(ns.getServerMaxRam(current)))
    while (true) {
        meta = updateMeta(ns, meta)
        ns.print(meta)
        doExec(ns, meta, limit)
        break;
        await ns.sleep(100)
    }
}

/** @param {import(".").NS } ns */
function buildMeta(ns) {
    let meta = {}
    for (const tc of ns.args) {
        let d = tc.split("=")
        let host = d[0]
        let target = d[1]
        meta[host] = {
            "name": host,
            "target": target,
            "min_security": ns.getServerMinSecurityLevel(host),
            "max_money": ns.getServerMaxMoney(host),
            "growth": ns.getServerGrowth(host),
            "running": 0,
            "next_id": 0,
        }
    }
    return meta
}

/** @param {import(".").NS } ns */
function updateMeta(ns, meta) {
    let ps = ns.ps()
    for (const i of meta) {
        i["security"] = ns.getServerSecurityLevel(i["name"])
        i["money"] = ns.getServerMoneyAvailable(i["name"])
        i["p_security"] = i["security"] / i["min_security"] * 100
        i["p_money"] = i["money"] / i["max_money"] * 100
        i["running"] = ps.filter(it => it.args[0] == i["name"]).length
    }
    return meta
}

/** @param {import(".").NS } ns */
function doExec(ns, meta, limit) {
    for (const i of meta) {
        if (i["target"] <= i["running"]) {
            return
        }
        let threads = (i["target"] - i["running"]) % limit
        if (threads == 0) {
            threads = limit
        }
        if (i["p_security"] > 200) {
            ns.exec("weaken.js", threads, i["name"], i["next_id"]++)
        } else if (p_money < 95) {
            ns.exec("grow.js", threads, i["name"], i["next_id"]++)
        } else if (Math.random() <= 0.8) {
            ns.exec("hack.js", threads, i["name"], i["next_id"]++)
        } else if (Math.random() <= 0.8) {
            if (Math.random() <= 0.5) {
                ns.exec("hack.js", threads, i["name"], i["next_id"]++)
            } else {
                ns.exec("grow.js", threads, i["name"], i["next_id"]++)
            }
        } else {
            ns.exec("weaken.js", threads, i["name"], i["next_id"]++)
        }
    }
}