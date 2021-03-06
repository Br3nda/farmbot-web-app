import { Everything } from "../interfaces";
import {
  selectAllLogs, maybeGetTimeSettings, selectAllEnigmas
} from "../resources/selectors";
import { LogsProps } from "./interfaces";
import {
  sourceFbosConfigValue
} from "../devices/components/source_config_value";
import { validFbosConfig, betterCompact } from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedLog } from "farmbot";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFbosConfig } from "../resources/getters";
import { chain } from "lodash";
import { isFwHardwareValue } from "../devices/components/fbos_settings/board_type";
import { DevSettings } from "../account/dev/dev_support";

/** Take the specified number of logs after sorting by time created. */
export function takeSortedLogs(
  numberOfLogs: number, ri: ResourceIndex): TaggedLog[] {
  return chain(selectAllLogs(ri))
    .sortBy("body.created_at")
    .reverse()
    .take(numberOfLogs)
    .value();
}

export function mapStateToProps(props: Everything): LogsProps {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig =
    sourceFbosConfigValue(fbosConfig, hardware.configuration);
  const apiFirmwareValue = sourceFbosConfig("firmware_hardware").value;
  const botAlerts = betterCompact(Object.values(props.bot.hardware.enigmas || {}));
  const apiAlerts = selectAllEnigmas(props.resources.index).map(x => x.body);
  const alerts =
    botAlerts.concat(DevSettings.futureFeaturesEnabled() ? apiAlerts : []);
  return {
    dispatch: props.dispatch,
    sourceFbosConfig,
    logs: takeSortedLogs(250, props.resources.index),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    getConfigValue: getWebAppConfigValue(() => props),
    alerts,
    apiFirmwareValue: isFwHardwareValue(apiFirmwareValue)
      ? apiFirmwareValue : undefined,
  };
}
