const Authorize = require('./authorize');
const BootNotification = require('./bootNotification');
const StartTransaction = require('./startTransaction');
const StopTransaction = require('./stopTransaction');
const Heartbeat = require('./heartbeat');
const MeterValues = require('./meterValues');
const StatusNotification = require('./statusNotification');
const FirmwareStatusNotification = require('./firmwareStatusNotification');
const DiagnosticsStatusNotification = require('./diagnosticsStatusNotification');
const DataTransfer = require('./dataTransfer');
const Reset = require('./reset');


module.exports = {
    Authorize: Authorize,
    BootNotification: BootNotification,
    StartTransaction: StartTransaction,
    StopTransaction: StopTransaction,
    Heartbeat: Heartbeat,
    MeterValues: MeterValues,
    StatusNotification: StatusNotification,
    FirmwareStatusNotification: FirmwareStatusNotification,
    DiagnosticsStatusNotification: DiagnosticsStatusNotification,
    DataTransfer: DataTransfer,
    Reset: Reset
}
