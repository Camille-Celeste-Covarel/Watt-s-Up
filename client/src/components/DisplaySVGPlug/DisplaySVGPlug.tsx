import type React from "react";
import type { PlugIconProps } from "../../types/stationDetailsTypes.ts";

import ChademoIcon from "../../assets/images/plug/Chademo_type4.svg?react";
import ComboCCSIcon from "../../assets/images/plug/Combo-ccs.svg?react";
import Type2Icon from "../../assets/images/plug/Type2.svg?react";
import TypeEFIcon from "../../assets/images/plug/ef.svg?react";
import UnknownPlugIcon from "../../assets/images/plug/ef.svg?react";

const plugIconMap: {
  [key: string]: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
} = {
  "Type 2": Type2Icon,
  "Combo CCS": ComboCCSIcon,
  Chademo: ChademoIcon,
  "Type EF": TypeEFIcon,
};

export const PlugIcon: React.FC<PlugIconProps> = ({ plugName, className }) => {
  const IconComponent = plugIconMap[plugName] || UnknownPlugIcon;
  return <IconComponent title={plugName} className={className} />;
};
