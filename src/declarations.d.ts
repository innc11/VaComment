// declare function $(_: any): any
// declare module 'jquery'

declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare interface Window {
    Valine: any
}