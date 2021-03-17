<template>
    <div class="smilie-set-widget">
        <div class="smilie-sets-tab smilies-scrollbar">
            <div class="smilie-set-icon" 
                v-for="(v, k) in smilies" 
                v-bind:key="k"
                v-bind:smilie-set="k" 
                v-bind:class="k==selectedSmilieSet?'selected':''" 
                v-bind:title="k"
                v-on:click="selectedSmilieSet=k"
            >
                <div class="preview" v-bind:style="'background-image: url('+getFirst(v)+')'"></div>
            </div>
        </div>

        <div class="smilie-box smilies-scrollbar">
            <div class="smilie-set"
                v-for="(v, k) in smilies" 
                v-bind:key="k"
                v-bind:smilie-set="k" 
                v-bind:style="k==selectedSmilieSet?'':'display: none'"
            >
                <span class="image"
                    v-for="(v2, k2) in smilies[k]" 
                    v-bind:data-tag="' :'+k2+': '" 
                    v-bind:title="k2"
                    v-bind:key="v2"
                >
                    <img class="smilie" 
                        v-bind:src="v2" 
                        v-bind:alt="k2" 
                        v-bind:data-tag="' :'+k2+': '" 
                        v-on:click.stop="onSmlieClick"
                    >
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
const $ = require('jquery')

export default Vue.extend({
    name: 'SmilieBox',
    methods: {
        getFirst: function(obj: any) {
            for (let o in obj)
                return obj[o]
        },
        onSmlieClick: function(e) {
            $('#awesome-comment-input').insert($(e.target).attr('data-tag'))
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
    .smilie-set-widget {
        .smilie-sets-tab {
            width: 100%;
            display: inline-flex;
            /* 	overflow-x: auto; */
            flex-direction: row;
            border-bottom: 2px solid #61616154;
            
            .smilie-set-icon {
                display: inline-flex;
                padding: 5px;
                cursor: pointer;
                margin: 5px;
                opacity: 0.4;
                
                transition: all 0.1s;

                .preview {
                    width: 32px;
                    height: 32px;
                    background-repeat: no-repeat;
                    background-size: contain;
                    /* margin-right: 5px; */
                }
                
                &.selected {
                    opacity: 1 !important;
                    // border-bottom: 3px solid black;
                    transform: translateY(-4px);
                }
            }


        }

        .smilie-box {
            width: 100%;
            height: 250px;
            overflow-y: auto;

            .smilie-set {
                .image {
                    cursor:pointer;

                    img {
                        margin: 2px;
                        min-width: 28px;
                        max-width: 64px;
                        display: inline-block;
                        box-shadow: unset;
                    }
                }
            }
        }
        
    }


    .smilies-scrollbar {
        overflow-y: auto;
        overflow-x: auto;

        &::-webkit-scrollbar {
            width: 14px;
            height: 14px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 2px;
            background: #00000059;
        }

        &::-webkit-scrollbar-track {
            border-radius: 4px;
            background: #cccccc6b;
        }

        &:hover::-webkit-scrollbar-thumb {
            background-color: #0000008c;
        }
    }
</style>
