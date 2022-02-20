/** @param {import(".").NS } ns */
export async function main(ns) {
  let host = ns.args[0]
  let init_sleep = ns.args[1]
  let m_security = ns.args[2]
  let m_money = ns.args[3]

  let current = ns.getHostname()
  let common_log = "from:" + current + "|to:" + host + "|"
  await ns.sleep(init_sleep)
  while (true) {
    let security = ns.getServerSecurityLevel(host);
    let money = ns.getServerMoneyAvailable(host);

    let p_security = security / m_security * 100
    let p_money = money / m_money * 100
    if (p_security > 200) {
      ns.tprint(common_log, "security:", p_security.toFixed(1), "%", "|", "money:", p_money.toFixed(1), "%", "|", "weakening...");
      await ns.weaken(host)
    }
    if (Math.random() <= 0.8) {
      ns.tprint(common_log, "security:", p_security.toFixed(1), "%", "|", "money:", p_money.toFixed(1), "%", "|", "growing...");
      await ns.grow(host)
      if (p_money > 95) { 
        ns.tprint(common_log, "security:", p_security.toFixed(1), "%", "|", "money:", p_money.toFixed(1), "%", "|", "hacking...");
        await ns.hack(host)
      }
    } else {
      ns.tprint(common_log, "security:", p_security.toFixed(1), "%", "|", "money:", p_money.toFixed(1), "%", "|", "weakening...");
      await ns.weaken(host)
    }
  }
}