<template>
    <div class="va-paginator smilies-scrollbara" tabindex="-1">
        <!-- <div class="va-pagin-previous">上</div> -->
        <div class="va-pagin"
            v-for="i in total"
            v-bind:class="i-1==current? 'active':''"
            v-bind:pagination="i-1"
            v-on:click="onClickPagination"
            v-show="total>1"
        >
            <div class="pain">{{i}}</div>
            <div class="icon">
                <div v-if="i-1==current && i-1!=0" v-bind:style="flip?'transform: rotate(180deg);':''">
                    <svg t="1606820644925" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1189" width="28" height="28"><path d="M748.172 510.713L527.533 290.074c-4.275-4.274-9.934-6.299-15.533-6.119-5.6-0.181-11.258 1.844-15.532 6.119L275.829 510.713c-8.201 8.201-8.201 21.5 0 29.701 8.202 8.202 21.5 8.202 29.702 0.001L512 333.945l206.469 206.47c8.203 8.201 21.5 8.201 29.703-0.001 8.201-8.201 8.201-21.5 0-29.701z" fill="#ffffff" p-id="1190"></path><path d="M748.172 704.202L527.533 483.564c-4.275-4.274-9.934-6.299-15.533-6.119-5.6-0.181-11.258 1.844-15.532 6.119L275.829 704.202c-8.201 8.201-8.201 21.5 0 29.701 8.202 8.203 21.5 8.203 29.702 0.002L512 527.436l206.469 206.47c8.203 8.201 21.5 8.201 29.703-0.002 8.201-8.202 8.201-21.501 0-29.702z" fill="#ffffff" p-id="1191"></path></svg>
                </div>

                <div v-if="i-1==current && i-1==0" style="padding-top: 9px;">
                    {{i}}
                </div>
            </div>
            
        </div>
        
        <!-- <div class="va-pagin-next">下</div> -->
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
const $ = require('jquery')

export default Vue.extend({
    data: () => {
        return {
            owner: null,
        }
    },
    methods: {
        onClickPagination: function (e) {
            let source = $(e.target)
            let pain = null

            // 向上查找 pagination 属性（最多3次）
            for(let i=0;i<3;i++) {
                let _t = source.attr('pagination')
                if(!_t) {
                    source = source.parent()
                } else {
                    pain = parseInt(_t)
                    break
                }
            }
            
            this.$emit('pagination-changed', pain)

            if(pain==this.current)
                this.$emit('pagination-repeatedly-click', pain)
        }
    },
    props: {
        total: {
            type: Number,
            required: true
        },
        current: {
            type: Number,
            required: true
        },
        flip: {
            type: Boolean,
            default: false
        }
    }
})
</script>

<style>
    .va-paginator {
        display: flex;
        padding-left: 0;
        list-style: none;
        padding: 10px;
        border-radius: .25rem;
        /* justify-content: center; */
        margin-top: 0.5rem;
        overflow-x: auto;
        /* overflow-y: hidden; */
        width: max-content;
        margin-left: auto;
        margin-right: auto;
        max-width: 100%;
        box-sizing: border-box;
        outline: none;
    }

    .va-pagin:hover {
        transform: translateY(-4px);
    }

    .va-pagin.active {
        z-index: auto;
        border-color: transparent;
        background-color: #6fcfff;
        color: #ffffff;
        overflow: hidden;
    }

    .va-pagin.active * {
        transition: all 0.3s;
    }

    .va-pagin.active .pain,
    .va-pagin.active .icon {
        transform: translateY(15px);
    }

    .va-pagin.active:hover .pain,
    .va-pagin.active:hover .icon {
        transform: translateY(-10px);
    }

    .va-pagin {
        flex-shrink: 0;
        flex-direction: column;
        font-size: 1rem !important;
        width: 35px !important;
        height: 35px !important;
        border-radius: 50%!important;
        transition: all 0.2s;
        /* line-height: 46px; */
        position: relative;
        border: .0625rem solid #dee2e671;
        cursor: pointer;
        color: #7c7c7c;
        display: flex;
        margin: 0 3px;
        padding: 0;
        align-items: center;
        justify-content: center;
        user-select: none;
    }

    .va-pagin:not(.active):hover {
        border: .0625rem solid #68686894;
        color: #3f3f3f;
    }


</style>