#!/usr/bin/env node
import path from 'path'
import fs from 'fs'
import program from 'commander';
import { spawnSync } from 'child_process'

const root_path = process.cwd();
const node = process.argv[0];
const nm_path = 'node_modules'
const yarnBin = path.resolve(process.env['npm_execpath'])

const max_depth = 10;

program
    .option('-w, --watch', 'generate watchlist')
    .option('-m, --mod', 'generate links for all modules in package.json')
    .parse(process.argv);

const relative_path = path => {
    return path.replace(root_path, '');
}

const readPKG = (packagePath, callback) => {

    const pkg = path.join(packagePath, 'package.json');
    console.log(`[RELINK] Reading ${relative_path(pkg)}`)

    fs.readFile(pkg, 'utf-8', function (error, content) {
        if (error || !content) {
            console.error('Unable to read ' + pkg + ':', error || 'no content');
            return;
        }

        try {
            const config = JSON.parse(content);

            if (config.isParseConfigFailed) {
                console.error('Unable to parse ' + pkg + ':', config.error);
                return;
            }
            callback(config);
        } catch (e) {
            console.error('pkg parse error', e)
        }
    });
}



export const relink = depth => (config) => {
    //console.warn("deprecated package.json links key. Use relink instead")
    console.log(depth)
    if (depth <= max_depth) {
        const packages = config.links;
        if (!config.links) {
            return console.error('no links defined')
        }


        var options = {
            node: node,
            yarn: yarnBin,
            // escape package names@versions
            packages: packages.map((pkg) => '"' + pkg + '"').join(' ')
        };


        packages.map(pkg => {
            link_pkg(root_path, pkg);


            readPKG(path.join(root_path, nm_path, pkg), relink(depth + 1));

        })
    } else {
        console.warn('max_depth reached aborting');
    }
}

const spawn_log = log => {
    log.stderr.length > 0 && console.error(log.stderr.toString())
    log.stdout.length > 0 && console.log(log.stdout.toString())
}


const link_pkg = (cwd, link_pkg) => {
    const relativepath = cwd.replace(root_path, './')
    console.info(`linking ${link_pkg} in ${relativepath} `)
    let log = spawnSync(`yarn`, ['link', link_pkg], { cwd })
    spawn_log(log)
}


export const relinkv2 = config => {


}

const watch = config => {
    const packages = config.links;
    if (!config.links) {
        console.log('');
    } else {
        console.log(config.links.map(pk => `--watch node_modules/${pk}`).join(' '))
    }
}


const create_link_pkg = pkg => {
    let log = spawnSync(`yarn`, ['link'], { cwd: path.join(root_path, 'node_modules', pkg) })
    log.stderr.length > 0 && console.error(log.stderr.toString())
    log.stdout.length > 0 && console.log(log.stdout.toString())
}

const link_module = config => {
    Object.keys(config.dependencies).map(create_link_pkg)
}

if (program.watch === true) {
    readPKG(root_path, watch)
} else if (program.mod === true) {
    readPKG(root_path, link_module)
} else {
    readPKG(root_path, relink(0))
}


