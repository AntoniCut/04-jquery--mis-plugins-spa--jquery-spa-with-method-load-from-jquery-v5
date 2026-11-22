/*
    *  ---------------------------------------------------------------------  *
    *  -----  spa-build-package.d.ts  --  /types/spa-build-package.d.ts  -----  *
    *  ---------------------------------------------------------------------  *
*/


//  -----  resolución de tipos para imports @antonydev/spa-build/* en checkJs  -----
/// <reference path="./spa-build-config.d.js" />


declare module '@antonydev/spa-build/generate-markdown-shiki.js' {

    /** - `genera bloques shiki según spa.config.js y las rutas del proyecto` */
    export function generateMarkdownShiki(options: {
        projectRoot: string;
        config: SpaBuildConfig;
    }): Promise<{ generated: number; skipped: number }>;

}


declare module '@antonydev/spa-build/register-gulp.js' {

    /** - `registra las tareas gulp del sitio (SPEC 03 paso 4)` */
    export function registerGulp(options: {
        projectRoot: string;
        config: SpaBuildConfig;
    }): Record<string, import('gulp').TaskFunction>;

}