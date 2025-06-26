import {
  Access,
  Compagny,
  Operator,
  Plug,
  Power,
  Provider,
} from "../models/_index";

export async function findOrCreateAccessByName(name: string): Promise<string> {
  const [access] = await Access.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return access.id;
}

export async function findOrCreateCompagnyByName(
  name: string,
): Promise<string> {
  const [compagny] = await Compagny.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return compagny.id;
}

export async function findOrCreateOperatorByName(
  name: string,
): Promise<string> {
  const [operator] = await Operator.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return operator.id;
}

export async function findOrCreateProviderByName(
  name: string,
): Promise<string> {
  const [provider] = await Provider.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return provider.id;
}

export async function findOrCreatePlugByName(name: string): Promise<string> {
  const [plug] = await Plug.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return plug.id;
}

export async function findOrCreatePowerByName(name: number): Promise<string> {
  // name est un number ici pour Power
  const [power] = await Power.findOrCreate({
    where: { name },
    defaults: { name },
  });
  return power.id;
}
