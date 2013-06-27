Emergency server settings
-------------------------

Have a server / app config designed for high-density overloads.

* Give logged-in users preferential treatement, etc.
* Decrease the size of the thread pool (on the order of 1 thread per CPU core)
* Increase timeouts (e.g. 200ms)

Manually switch to emergency config when needed.

This idea is similar to [approximating Beer Garden](##approxbg).