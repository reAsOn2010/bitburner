/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let info = {}
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
            let _info = {
                "name": h,
                "root": ns.hasRootAccess(h),
                "ports": ns.getServerNumPortsRequired(h),
                "max_memory": ns.getServerMaxRam(h),
                "used_memory": ns.getServerUsedRam(h),
                "min_security": ns.getServerMinSecurityLevel(h),
                "security": ns.getServerSecurityLevel(h),
                "max_money": ns.getServerMaxMoney(h),
                "money": ns.getServerMoneyAvailable(h),
                "growth": ns.getServerGrowth(h),
            }
            if (_info["root"]) {
                info[h] = _info
            }
        }
    }
    ns.tprintf("name|has_root|need_ports|max_memory|used_memory|min_security|security|max_money|money|growth")
    for (const _info of Object.values(info)) {
        ns.tprintf("%s|%s|%d|%d|%d|%f|%f|%d|%d|%f", 
            _info["name"], _info["root"], _info["ports"], _info["max_memory"], _info["used_memory"],
            _info["min_security"], _info["security"], _info["max_money"], _info["money"], _info["growth"])
    }
}