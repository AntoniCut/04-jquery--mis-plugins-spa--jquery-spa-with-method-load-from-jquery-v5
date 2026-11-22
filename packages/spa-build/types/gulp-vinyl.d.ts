/*
    *  -------------------------------------------------------  *
    *  -----  gulp-vinyl.d.ts  --  /types/gulp-vinyl.d.ts  -----  *
    *  -------------------------------------------------------  *
*/


//  -----  tipos mínimos de vinyl para streams de gulp en checkJs  -----

declare module 'vinyl' {

    /** - `archivo del stream de gulp` */
    export interface Vinyl {

        path: string;

        relative: string;

        contents: Buffer | null;

        stat?: {

            isDirectory(): boolean;

        };

        isNull(): boolean;

        isStream(): boolean;

        isBuffer(): boolean;

    }

}