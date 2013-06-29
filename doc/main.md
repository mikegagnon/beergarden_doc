**Beer Garden** defends web applications against *high-density* DoS attacks.

A [high-density attack](##highdensityattacks) is a DoS attack where each individual request consumes a disproportionate amount of resources.
They are more threatening than [conventional DoS attacks](##lowdensityattacks).

Beer Garden treats the server like a crowded "beer garden" (see [illustration of concept](##overviewfigure) and [illustration of architecture](##archfigure)):

* [The Doorman](##doorman) limits the attack rate by charging each request an "admission fee.""
* [The Bouncer](##bouncer) evicts old requests to make room for new requests.
* A [Signature Service](##sigservice) develops signatures for high-density requests, which helps the Doorman charge greater admission fees for suspicious requests.

[In theory](##intheory), such a defense gives legitimate users preferential treatment as long as their aggregate computational resources outweigh the attacker's.

In our experiments, [Beer Garden was moderately successful](##experiments) at defending [several web applications](##testapplications) against a variety of attacks.

We conclude that [the Beer Garden approach is effective in many circumstances](##conclusion), and we identify [future work](##futurework) that could further improve its defensive capability.

We have also identified [several simple techniques](##otherdefensiveideas) you can use in lieu of Beer Garden to protect your web applications from high-density attacks.

By [Mike Gagnon](mailto:mikegagnon@gmail.com) and [Ivan Balepin](mailto:ivan.balepin@gmail.com).

* This document was created using [Sidenote](http://mikegagnon.com/sidenote).
* Source code for this doc is [on Github](https://github.com/mikegagnon/beergarden_doc).
* Source code for the Beer Garden is also [on Github](https://github.com/mikegagnon/nginx-overload-handler).


<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.en_US"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.en_US">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.