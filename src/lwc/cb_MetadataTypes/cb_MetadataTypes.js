import { LightningElement,track } from 'lwc';
import getAllMetadataNames from '@salesforce/apex/cb_metadataExplorer.getAllMetadataNames';
import getMetadataRecords from '@salesforce/apex/cb_metadataExplorer.getMetadataRecords';

export default class Cb_MetadataTypes extends LightningElement {
    @track data = [];
    @track viewabledata = [];
    loaded = true;
    searchableValue = "";
    connectedCallback(){
        this.loaded = false;
        getAllMetadataNames().then((res) =>{
            this.data = res;
            this.viewabledata = res;
            this.loaded = true;
        })
    }

    FilterSubjects(e) {
        if(e.detail.value == ""){
            this.viewabledata = [];
        }else{
            let arry = this.data.find( ( title ) => title.label === e.detail.value );
            this.viewabledata = [arry];
        }
        if(this.viewabledata.length == 0){
            this.viewabledata = this.data;
        }
    }

    handleManage(event){
        this.loaded = false;
        let type  = event.target.dataset.type;
        let name = event.target.dataset.name;
        getMetadataRecords({metadataApiName: name,extraFields: [],limiter:"",whereq:""}).then((res) =>{
            this.loaded = true;
            this.shootEvent(type,{name:name, value:res, fields:res[0].fields});
        })
    }

    shootEvent(type,value){
        const selectedEvent = new CustomEvent(type, {
            detail : value
          });
        this.dispatchEvent(selectedEvent);
    }
}