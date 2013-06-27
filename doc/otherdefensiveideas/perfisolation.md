Performance isolation
---------------------

* Instead of embedding "dangerous" algorithms in application code, put each in a separate service.
    * E.g. a "quicksort" service
* If that service gets overloaded, then that feature is no longer available
    * But everything else should work
    * Application should be developed to gracefully handle crashed services
* Linux containers could be useful here.
