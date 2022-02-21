/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("ALL")
    let meta = buildMeta(ns)
    let current = ns.getHostname()
    let limit = Math.round(Math.log2(ns.getServerMaxRam(current)))
    let timer = Date.now()
    while (true) {
        meta = updateMeta(ns, meta)
        doExec(ns, current, meta, limit)
        if (Date.now() - timer > (9 + Math.random()) * 1000 ) {
            for (const i of Object.values(meta)) {
                ns.tprintf("name:%s|security:%f|money:%f", i["name"], i["p_security"], i["p_money"])
            }
            timer = Date.now()
        }
        await ns.sleep(100 + Math.random() * 400)
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
    for (const i of Object.values(meta)) {
        i["security"] = ns.getServerSecurityLevel(i["name"])
        i["money"] = ns.getServerMoneyAvailable(i["name"])
        i["p_security"] = i["security"] / i["min_security"] * 100
        i["p_money"] = i["money"] / i["max_money"] * 100
        i["running"] = ps.filter(it => ["grow.js", "hack.js", "weaken.js"].includes(it.filename) && it.args[0] == i["name"]).reduce((sum, it) => sum + it.threads, 0)
    }
    return meta
}

/** @param {import(".").NS } ns */
function doExec(ns, current, meta, limit) {
    for (const i of Object.values(meta)) {
        if (i["target"] <= i["running"]) {
            continue
        }
        let threads = (i["target"] - i["running"]) % limit
        if (threads == 0) {
            threads = limit
        }
        if (i["p_security"] > 200) {
            ns.exec("weaken.js", current, threads, i["name"], i["next_id"]++)
        } else if (i["p_money"] < 95) {
            ns.exec("grow.js", current, threads, i["name"], i["next_id"]++)
        } else if (Math.random() <= 0.8) {
            // TODO: take growth into consideration
            if (Math.random() <= 0.5) {
                ns.exec("hack.js", current, threads, i["name"], i["next_id"]++)
            } else {
                ns.exec("grow.js", current, threads, i["name"], i["next_id"]++)
            }
        } else {
            ns.exec("weaken.js", current, threads, i["name"], i["next_id"]++)
        }
    }
}