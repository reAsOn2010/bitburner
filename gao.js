export async function main(ns) {
  ns.tprint(ns.args); 
  if (!Boolean(ns.args[0])) {
    ns.disableLog("ALL");
  }
  
  let host = ns.args[1];
  let m_security = await ns.getServerMinSecurityLevel(host);
  let m_money = await ns.getServerMaxMoney(host);
  let growth = await ns.getServerGrowth(host);
  if (growth > 100) {
    growth = 100
  }
  let current = ns.getHostname()
  let common_log = "from:" + current + " target:" + host + "|" + "m_s:" + m_security + " m_m:" + m_money + "|"
  ns.tprint("growth:", growth)
  while (true) { 
    let security = await ns.getServerSecurityLevel(host);
    let money = await ns.getServerMoneyAvailable(host);

    let p_security = security / m_security * 100
    let p_money = money / m_money * 100

    ns.tprint(common_log, "security:", p_security, "%");
    ns.tprint(common_log, "money:", p_money, "%");

    if (p_security > 110) {
      ns.tprint(common_log, "weakening...")
      await ns.weaken(host)
    }
    else if (p_money < 100.0 / (100 + growth) * 100) {
      ns.tprint(common_log, "growing...")
      await ns.grow(host)
    } else {
      ns.tprint(common_log, "hacking...")
      await ns.hack(host)
    }
  }
}

async function run(ns, host) {
  let m_security = await ns.getServerMinSecurityLevel(host);
  let m_money = await ns.getServerMaxMoney(host);
  let growth = await ns.getServerGrowth(host);
  ns.print("growth:" + growth)
  if (growth)
  while (true) { 
    let security = await ns.getServerSecurityLevel(host);
    let money = await ns.getServerMoneyAvailable(host);

    let p_security = security / m_security * 100
    let p_money = money / m_money * 100

    ns.print("security:" + p_security + "%");
    ns.print("money:" + p_money + "%");

    if (p_security > 110) {
      ns.print("weakening...")
      await ns.weaken(host)
    }
    if (p_money < 100.0 / (100 + growth) * 100) {
      ns.print("growing...")
      await ns.grow(host)
    }
    ns.print("hacking...")
    await ns.hack(host)
  }
}