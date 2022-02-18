/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    let files = ns.ls("home", ".js")
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
            await ns.scp(files, h)
            hosts.push(h)
        }
    }
}