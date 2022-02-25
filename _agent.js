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
            "limit": Math.round(Math.pow(1.35, Math.log2(ns.getServerMaxRam(from)))),
            "to": to,
            "replicas": replicas,
            "min_security": ns.getServerMinSecurityLevel(to),
            "max_money": ns.getServerMaxMoney(to),
            "growth": ns.getServerGrowth(to),
            "running": 0,
            "grow_id": 0,
            "hack_id": 0,
            "weaken_id": 0,
            "next_grow": 0,
            "next_hack": 0,
            "next_weaken": 0,
        }
        detail["p_count"] = Math.ceil(detail["replicas"] / detail["limit"])
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
            detail["grow_time"] = ns.getGrowTime(detail["to"])
            detail["hack_time"] = ns.getHackTime(detail["to"])
            detail["weaken_time"] = ns.getWeakenTime(detail["to"])
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
                execWeaken(ns, detail)
                // ns.exec("weaken.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            } else if (detail["p_money"] < 95) {
                execGrow(ns, detail)
                // ns.exec("grow.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            } else if (Math.random() <= 0.8) {
                // TODO: take growth into consideration
                if (Math.random() <= 0.5) {
                    execHack(ns, detail)
                    // ns.exec("hack.js", detail["from"], threads, detail["to"], detail["next_id"]++)
                } else {
                    execGrow(ns, detail)
                    // ns.exec("grow.js", detail["from"], threads, detail["to"], detail["next_id"]++)
                }
            } else {
                execWeaken(ns, detail)
                // ns.exec("weaken.js", detail["from"], threads, detail["to"], detail["next_id"]++)
            }
        } 
    }
}

/** @param {import(".").NS } ns */
function execHack(ns, detail) {
    let now = Date.now()
    let sleep = Math.max(detail["next_hack"] - now, 0)
    ns.exec("hack.js", detail["from"], threads, detail["to"], detail["hack_id"]++, sleep)
    detail["next_hack"] = now + detail["hack_time"] / detail["p_count"]
}

/** @param {import(".").NS } ns */
function execGrow(ns, detail) {
    let now = Date.now()
    let sleep = Math.max(detail["next_grow"] - now, 0)
    ns.exec("grow.js", detail["from"], threads, detail["to"], detail["grow_id"]++, sleep)
    detail["next_grow"] = now + detail["grow_time"] / detail["p_count"]
}

/** @param {import(".").NS } ns */
function execWeaken(ns, detail) {
    let now = Date.now()
    let sleep = Math.max(detail["next_weaken"] - now, 0)
    ns.exec("weaken.js", detail["from"], threads, detail["to"], detail["weaken_id"]++, sleep)
    detail["next_weaken"] = now + detail["weaken_time"] / detail["p_count"]
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