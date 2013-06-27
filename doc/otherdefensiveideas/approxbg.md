Approximate Beer Garden
-----------------------

* Easy to implement application-specific approximation of Beer Garden 
* Approximate Signature Service
    * Heuristically detect high-density requests
* Approximate Doorman: try to allocate resources "securely"
    * Give logged in users preference
    * Each "identity" (IP address or username) gets certain number of requests per minute
    * Give non-suspicious requests preferential treatment. For example:
        * Quarantine suspicious requests: if you have 10 backend machines, send the suspicious requests to 1 designated backend. Send all other requests to the remaining 9.
* Approximate Bouncer
    * During overloads increase aggressiveness of timeouts
