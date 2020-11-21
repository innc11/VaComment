<template>
    <div>
        <div class="smilie-set-tab smilies-scrollbar">
        <div v-for="(v, k) in smilies">
            <div v-bind:smilie-set="k" 
                class="smilie-set" 
                v-bind:class="k==selectedSmilieSet?'smilie-set-tab-selected':''" 
                v-bind:title="k"
                v-on:click="selectedSmilieSet=k">
                <div v-bind:style="'background-image: url('+getFirst(v)+')'"></div>
            </div>
        </div>
    </div>

    <div class="smilies smilies-scrollbar">
        <div v-for="(v, k) in smilies" 
            v-bind:smilie-set="k" 
            class="smilie-set-box" 
            v-bind:style="k==selectedSmilieSet?'':'display: none'">
            <span v-for="(v2, k2) in smilies[k]" style="cursor:pointer;" v-bind:data-tag="' :'+k2+': '" v-bind:title="k2">
                <img class="smilie" v-bind:src="v2" v-bind:alt="k2" v-bind:data-tag="' :'+k2+': '" v-on:click.stop="onSmlieClick">
            </span>
        </div>
    </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    methods: {
        getFirst: function(obj: any) {
            for (let o in obj)
                return obj[o]
        },
        onSmlieClick: function(e) {
            $('#va-comment-editor').insert($(e.target).attr('data-tag'))
        },
        defaultSmilieSet: function() {
            for (let o in this.smilies) {
                this.selectedSmilieSet = o
                return
            }
        }
    },
    data: () => {
        return {
            smilies: {},
            selectedSmilieSet: '',
        }
    },
})
</script>


<style lang="scss">
    /* 表情包按钮 */
    .smilie-set {
        display: inline-flex;
        padding: 5px;
        cursor: pointer;
        margin: 5px;

        opacity: 0.4;
    }

    /* 表情包按钮中的表情预览 */
    .smilie-set div {
        width: 32px;
        height: 32px;
        background-repeat: no-repeat;
        background-size: contain;
        /* margin-right: 5px; */
    }

    /* 表情选项卡 */
    .smilie-set-tab {
        width: 100%;
        display: inline-flex;
        /* 	overflow-x: auto; */
        flex-direction: row;
        border-bottom: 2px solid #61616154;
    }

    /* 表情包按钮被选中时的效果 */
    .smilie-set-tab-selected {
        opacity: 1 !important;
        border-bottom: 3px solid black;
    }

    /* 表情列表 */
    .smilies {
        width: 100%;
        height: 250px;
        overflow-y: auto;
    }
    /* 表情列表(在编辑器界面时) */
    .wmd-prompt-dialog .smilies {
        height: 250px;
    }

    /* 表情图片 */
    img.smilie {
        margin: 2px;
        min-width: 28px;
        max-width: 64px;
        display: inline-block;
        box-shadow: unset;
    }


    /* 表情选择按钮 */
    #smiliesbutton img {
        width: 40px;
        margin: 2px;
    }



    /* 滚动条样式 */
    .smilies-scrollbar {
        overflow-y: auto;
        overflow-x: auto;
    }

    .smilies-scrollbar::-webkit-scrollbar {
        width: 14px;
        height: 14px;
    }

    .smilies-scrollbar::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background: #00000059;
    }

    .smilies-scrollbar::-webkit-scrollbar-track {
        border-radius: 4px;
        background: #cccccc6b;
    }

    .smilies-scrollbar:hover::-webkit-scrollbar-thumb{
        background-color: #0000008c;
    }
</style>
