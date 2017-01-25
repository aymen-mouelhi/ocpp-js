# ocpp-js
Open Charge Point Protocol Implementation in JS

## Overview

Open Charge Point Protocol (OCPP, <http://ocppforum.net>) is a communication
protocol between multiple charging stations ("charge points") and a single
management software ("central system").

Currently two OCPP versions (1.2 and 1.5) have been released.
There is a draft in progress for a new version (2.0).
Both existing versions use SOAP over HTTP as the RPC/transport protocol:

    +---------------+ soap/http client      soap/http server +---------------+
    |               |--------------------------------------->|               |
    |               |  Operations initiated by ChargePoint   |               |
    |  ChargePoint  |                                        | CentralSystem |
    |               | soap/http server      soap/http client |               |
    |               |<---------------------------------------|               |
    +---------------+  Operations initiated by CentralSystem +---------------+
