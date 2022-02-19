/** @param {NS} ns **/
export async function main(ns) {
    let hosts = ["home"]
    let i = 0
    // let files = ns.ls("home", ".js")
    if (ns.args[0] == "kube") {
        let results = ns.scan("home").filter(it => it.startsWith("kube"))
        for (const h of results) {
            ns.killall(h)
        }
        return
    }
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
            ns.killall(h)
            // for (const f of files) {
            //     ns.kill(f, h)
            // }
            hosts.push(h)
        }
    }
}