/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("ALL")
    let meta = buildMeta(ns)
    let timer = Date.now()
    while (true) {
        meta = updateMeta(ns, meta)
        doExec(ns, meta)
        if (Date.now() - timer > 10 * 1000) {
            printDetails(ns, meta)
            timer = Date.now()
        }
        await ns.sleep(500)
    }
}

/** @param {import(".").NS } ns */
function buildMeta(ns) {
    let meta = {}
    for (const tc of ns.args) {
        let d = tc.split("=")
        let from = d[0]
        let to = d[1]
        let replicas = d[2]
        let detail = {
            "from": from,
            "limit": Math.round(Math.pow(1.5, Math.log2(ns.getServerMaxRam(from)))),
            "to": to,
            "replicas": replicas,
            "min_security": ns.getServerMinSecurityLevel(to),
            "max_money": ns.getServerMaxMoney(to),
            "growth": ns.getServerGrowth(to),
            "running": 0,
            "next_id": 0,
        }
        if (from in meta) {
            meta[from].push(detail)
        } else {
            meta[from] = [detail]
        }
    }
    return meta
}

/** @param {import(".").NS } ns */
function updateMeta(ns, meta) {
    for (const from of Object.keys(meta)) {
        let details = meta[from]
        for (const detail of details) {
            let ps = ns.ps(detail["from"])
            detail["security"] = ns.getServerSecurityLevel(detail["to"])
            detail["money"] = ns.getServerMoneyAvailable(detail["to"])
            detail["p_security"] = detail["security"] / detail["min_security"] * 100
            detail["p_money"] = detail["money"] / detail["max_money"] * 100
            detail["running"] = ps.filter(it => ["grow.js", "hack.js", "weaken.js"].includes(it.filename) && it.args[0] == detail["to"]).reduce((sum, it) => sum + it.threads, 0)
        }
    }
    return meta
}

/** @param {import(".").NS } ns */
function doExec(ns, meta) {
    for (const from of Object.keys(meta)) {
        let details = meta[from]
        for (const detail of details) {
            if (detail["replicas"] <= detail["running"]) {
                continue
            }
            let threads = (detail["replicas"] - detail["running"]) % detail["limit"]
            if (threads == 0) {
                threads = detail["limit"]
            }
            if (detail["p_security"] > 200) {
                ns.exec("weaken.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            } else if (detail["p_money"] < 95) {
                ns.exec("grow.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            } else if (Math.random() <= 0.8) {
                // TODO: take growth into consideration
                if (Math.random() <= 0.5) {
                    ns.exec("hack.js", detail["from"], threads, detail["to"], detail["next_id"]++)
                } else {
                    ns.exec("grow.js", detail["from"], threads, detail["to"], detail["next_id"]++)
                }
            } else {
                ns.exec("weaken.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            }
        } 
    }
}

/** @param {import(".").NS } ns */
function printDetails(ns, meta) {
    let dup = []
    for (const from of Object.keys(meta)) {
        let details = meta[from]
        for (const detail of details) {
            if (dup.includes(detail["to"])) {
                continue
            } else {
                ns.tprintf("to:%s|security:%f|money:%f", detail["to"], detail["p_security"].toFixed(2), detail["p_money"].toFixed(2))
                dup.push(detail["to"])
            }
        }
    }
    ns.tprintf("------")
}