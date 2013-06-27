The Bouncer
-----------

The Bouncer evicts old requests to make room for new requests.

Mechanism
---------
* The Bouncer is implemented in two places:
    1. The [load balancer]() in the Nginix web server, which keeps track of each request in the web application.
    2. An independent process that restarts FastCGI servers (when the load balancer requests it).
* If the load balancer receives a request, but the worker pool is full, then it:
    1. evicts the request that has been in the server the longest, and
    2. sends the new request to a **spare worker**.

Why does this help legitimate clients?
-------------------------------------
* Legitimate requests tend to finish quickly.
* Malicious requests finish slowly (or maybe even never).
* Therefore malicious requests are more likely to be evicted.
See how the Doorman fits into [the theory of Beer Garden](##intheory).
