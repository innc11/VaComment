<template>
    <div class="va-paginator smilies-scrollbara">
        <!-- <div class="va-pagin-previous">上</div> -->
        <div class="va-pagin"
            v-for="i in total"
            v-bind:class="i-1==current? 'active':''"
            v-bind:pagination="i-1"
            v-on:click="onClickPagination"
            v-show="total>1"
        >{{i}}</div>
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
            this.$emit('pagination-changed', parseInt($(e.target).attr('pagination')))
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
    }

    .va-pagin:hover {
        transform: translateY(-4px);
    }

    .va-pagin.active {
        z-index: auto;
        border-color: transparent;
        background-color: #6fcfff;
        color: #ffffff;
    }

    .va-pagin {
        flex-shrink: 0;
        font-size: 1rem !important;
        width: 35px !important;
        height: 35px !important;
        border-radius: 50%!important;
        transition: all 0.2s;
        line-height: 46px;
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