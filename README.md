# relink

[![GitHub stars](https://img.shields.io/github/stars/fdt2k/relink.svg?style=social&label=Stars)](https://github.com/fdt2k/relink)

> Relinks packages from package.json

Please ★ this repo if you found it useful ★ ★ ★


## Story Time


Relink is a script for Yarn that allow you to use your use and work on your local packages as you go without republishing them every time.

I came up with this while working on my microservices libs, I had a sh*t load of packages and a lot of stuff to modify at the same time with micromanaging unittests & dependencies. Publishing or manually linking them was not a productive option.

It's also useful with React, to use the same version if you develop hooks or stuff that requires an identical version of react that persist even when you add a new dep with yarn (which sometimes decide to remove the link of your linked deps)

## Usage


### install 

> yarn global add yarn-relink


### usage

Let's say you work on lib-a and lib-b, lib-a being a dep of lib-b


Add the following to your lib-b package.json

    {
        ... 
        "links": [
            "lib-a"
        ],
        "scripts": {
            "prepare": "relink",
            "relink": "relink",
            .... your scripts ... 
        },
        ...
    }


then in lib-a folder, just use yarn link as usual

    $> yarn link 

    success Registered "lib-a".
    info You can now run `yarn link "lib-a"` in the projects where you want to use this package and it will be used instead.
    Done in 0.04s.


and in lib-b folder 
    
    $> yarn link lib-a
    
    yarn link v1.22.10
    success Using linked package for "lib-a".
    Done in 0.03s.


And you're good to go. 

Now everytime you use yarn add or yarn install, it'll automatically reapply links and reapply links in your linked packages.



Bonus stage: if you use nodemon  to automatically reload while coding you can now do it for your whole lib chain by adding a line like this. Doing this in all your local dev libs, will allow you to automagically reload the whole dependency chain. 

    ...
    "scripts": {
        ...
        "start:dev": "nodemon $(relink -w) --watch src  src/index.js"
        ...
    }
    ...


To use this feature you **HAVE TO** add a nodemon.json file at the root of your project folder or the watch deamon will not work. 

nodemon.json

    {
        "ignoreRoot": [".git"]
    }


## Todo

* relink.json instead of using package.json
* add max_depth as an argument
* categorize the links so you don't have to watch all the links in nodemon.



## Contribute

[Contribute](https://github.com/fdt2k/relink/blob/master/CONTRIBUTING.md) usage docs


## Support

Submit an [issue](https://github.com/fdt2k/relink/issues/new)

## Contributing

Review the [guidelines for contributing](https://github.com/fdt2k/relink/blob/master/CONTRIBUTING.md)


## License

[MIT License](https://github.com/fdt2k/relink/blob/master/LICENSE)

[Fabien Karsegard](https://geekagency.ch) © 2020


## Changelog

Review the [changelog](https://github.com/fdt2k/relink/blob/master/CHANGELOG.md)


## Credits

* [Fabien Karsegard](https://www.geekagency.ch) - Author
