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
                "max_memory": ns.getServerMaxRam(h),
                "used_memory": ns.getServerUsedRam(h),
                "root": ns.hasRootAccess(h),
                "security": ns.getServerSecurityLevel(h),
                "ports": ns.getServerNumPortsRequired(h),
            }
            if (_info["ports"] === 0) {
                info[h] = _info
            }
        }
    }
    ns.print(info)
}