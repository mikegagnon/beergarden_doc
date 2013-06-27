Theory
------

[Illustration](##overviewfigure).

1. Charging an [admission fee](##doorman) limits the rate by which an individual computer can submit requests.
2. If:
    1. the attacker is using a small number of computers, and
    2. legitimate users are using a large number of computers,
    3. **then** legitimtate requests will be admitted more often.
* Legitimate requests will tend to finish quickly.
* Malicious requests will finish slowly (or maybe even never).
* If a request arrives and the server is 100% full, do not enqueue the request.
    * Rather, evict the request that has been in the server the longest.
    * This request will most likely be malicious.
    * This keeps the request queue empty and bounds the worker-pool size.
* Since:
    1. evicted requests are more likely to be evicted, and
    2. legitimate requests are more likely to be admitted,
    3. **then** legitimate users receive preferential treatment.
