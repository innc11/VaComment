<template>
    <div class="va-paginator">
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

export default Vue.extend({
    data: () => {
        return {
            owner: null,
            total: 0,
            current: 0
        }
    },
    methods: {
        onClickPagination: function (e) {
            this.current = $(e.target).attr('pagination')
        }
    },
    watch: {
        total: function (newV, oldV) {
            if (this.current > this.total)
                this.current = this.total
        },
        current: function (newV, oldV) {
            if (this.current > this.total)
                this.current = this.total

            if (newV != oldV)
                this.owner.refresh()
        }
    }
})
</script>

<style>
    .va-paginator {
        display: flex;
        padding-left: 0;
        list-style: none;
        border-radius: .25rem;
        cursor: pointer;

        justify-content: center;
    }

    .va-pagin:hover {
        transform: translateY(-4px);
    }

    .va-pagin {
        display: inline-block;
    }

    .va-paginator .active {
        z-index: auto;
        border-color: transparent;
        background-color: #ffa3b4;
    }

    .va-pagin {
        font-size: 1.2rem !important;
        width: 35px !important;
        height: 35px !important;
        border-radius: 50%!important;
        transition: all 0.2s;
        line-height: 46px;
        position: relative;
        border: .0625rem solid #dee2e6;
        display: flex;
        margin: 0 3px;
        padding: 0;
        align-items: center;
        justify-content: center;
        user-select: none;
    }


</style>