import * as lib from "./lib.js"

/** @param {import(".").NS } ns */
export async function main(ns) {
    ns.disableLog("ALL")
    let timer = Date.now()
    await execLoop(ns)
    let kube_timer = Date.now()
    let node_timer = Date.now()
    while (true) {
        let now = Date.now()
        if (now - timer > 1000  * 60 *  60 * 2) {
            ns.print("timeout reload all.")
            await execLoop(ns)
            timer = now
        }
        if (now - node_timer > 200) { 
            ns.print("buy nodes...")
            lib.buynodes(ns)
            node_timer = now
        }
        if (now - kube_timer > 1000 * 10) {
            ns.print("buy kubes...")
            if (await lib.buykubes(ns)) {
                await execLoop(ns)
            }
            kube_timer = now
        }
        await ns.sleep(200)
    }
}

import * as kill from "./kill.js" 
import * as root from "./root.js"
import * as scp from "./scp.js"
import * as exec from "./exec.js"
/** @param {import(".").NS } ns */
export async function execLoop(ns) {
    await kill.main(ns)
    await root.main(ns)
    await scp.main(ns)
    await exec.main(ns)
}