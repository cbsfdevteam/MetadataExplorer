import { LightningElement,api,track } from 'lwc';
import updateCustomMetadata from '@salesforce/apex/cb_metadataExplorer.updateCustomMetadata';
import createCustomMetadata from '@salesforce/apex/cb_metadataExplorer.createCustomMetadata';
import getMetadataRecords from '@salesforce/apex/cb_metadataExplorer.getMetadataRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class Cb_Metadata_Tab extends LightningElement {
    @api metadata = [];
    @track viewabledata = [];
    modaltitle;
    modalbody = [];
    changesName;
    changesLabel;
    filterfield = "";
    @track changes = [];
    editMode = false;
    modaltype = "new";
    @track filterFields=[{label:"Label", value:""}];
    showallbutton = true;


    //filter records based on filter options
    filterRecords(e) {
        if(e.detail.value == ""){
            this.viewabledata = [];
        }else{
            let arry = this.metadata.records.find( ( title ) => title.label === e.detail.value );
            let tempArray = {name:this.metadata.name,records:[],fields:this.metadata.fields};
            tempArray.records.push(JSON.parse(JSON.stringify(arry)));
            this.viewabledata = tempArray;
        }
        if(this.viewabledata.length == 0){
            this.viewabledata = this.metadata;
        }
    }

    // save second copy of the retrived data for filtering
    connectedCallback(){
        this.viewabledata = this.metadata;
    }

    //refresh records when data is updated / changed or just retrived.
    refreshRecords(event){
        this.shootEvent("updaterecordfields",{name:event.detail.name,value:event.detail.value});
        this.resetSelectedRow();
        this.refreshfilteroptions(event.detail.value);
    }

    onSelectedFilterField(event){
        this.filterfield = event.detail.value;
        console.log(this.filterfield);
    }

    //refresh fields of the metadata object for filtering
    refreshfilteroptions(event){
        let fieldNames = [];
        fieldNames.push({label:"Label", value:""});
        event.forEach(field => {
            fieldNames.push({label:field.name, value:field.name})
        });
        this.filterFields = fieldNames;
    }


    @api
    refreshfromparent(affectedRow){
        this.shootEvent("updaterecordfields",{name:this.metadata.name,value:this.metadata.fields});
        if(this.currentSelectedRow != undefined){
            this.currentSelectedRow.style.backgroundColor = 'lightblue';
        }
    }


    refreshRecordsButton(){
        this.shootEvent("updaterecordfields",{name:this.metadata.name,value:this.metadata.fields});
    }

    shootEvent(type,value){
        const selectedEvent = new CustomEvent(type, {
            detail : value
          });
        this.dispatchEvent(selectedEvent);
    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Operation Started.',
            variant: 'success',
            mode: 'dismissable',
            message: 'Please use the refresh button to see the results.',
        });
        this.dispatchEvent(event);
    }


    resetSelectedRow(){
        if(this.currentSelectedRow != undefined){
            this.currentSelectedRow.style.backgroundColor = '';
        }
    }
    openModal(event){
        this.editMode = false;
        this.modaltype = "edit";
        this.resetSelectedRow();
        this.currentSelectedRow = event.currentTarget;
        let arry = this.metadata.records.find( ( data ) => data.name === event.currentTarget.dataset.name );
        this.changesName = arry.details[1];
        this.changesLabel = arry.details[0];
        let arrybody = [];
        this.modaltitle = arry.name;
        arrybody.push({key:"MasterLabel",value:arry.details[0],type:"STRING"});
        arrybody.push({key:"DeveloperName",value:arry.details[1],type:"STRING"});
        for (let index = 2; index < arry.details.length; index++) {
            const mykay = arry.fields[index - 2].name;
            const mytype = arry.fields[index - 2].type;
            const myvalue = arry.details[index];
            arrybody.push({key:mykay,value:myvalue,type:mytype});
        }
        this.modalbody = arrybody;
        const elm = this.template.querySelector('c-cb_mte_modal');
        elm.openmodal();
    }

    openModalnew(){
        this.editMode = true;
        this.modaltype = "new";
        let arrybody = [];
        this.modaltitle = "new Record";
        arrybody.push({key:"MasterLabel",value:"",type:"STRING"});
        arrybody.push({key:"DeveloperName",value:"",type:"STRING"});
        for (let index = 0; index < this.metadata.fields.length; index++) {
            const mykay = this.metadata.fields[index].name;
            const mytype = this.metadata.fields[index].type;
            const myvalue = "";
            arrybody.push({key:mykay,value:myvalue,type:mytype});
        }
        this.modalbody = arrybody;
        const elm = this.template.querySelector('c-cb_mte_modal');
        elm.openmodal();
    }

    closeModal(){
        this.cancelEdit();
        const elm = this.template.querySelector('c-cb_mte_modal');
        elm.closemodal();
    }

    openEdit(){
        this.changes = [];
        this.editMode = true;
    }

    cancelEdit(){
        this.changes=[];
        this.editMode = false;
    }

    async saveEdit(){
        let title = this.metadata.name;
        if(this.modaltitle === "new Record"){
            this.changesName = this.changes[1].value;
            await createCustomMetadata({metadataName:title,label:this.changes[0].value,apiname:this.changes[1].value,metadataFieldValueMap:this.changes});
        }else{
            await updateCustomMetadata({metadataName:title,recordDevName:this.changesName,label:this.changesLabel,metadataFieldValueMap:this.changes});
        }
        this.shootEvent("retrieveandcompare",{metadataName:title,recordDevName:this.changesName,label:this.changesLabel,metadataFieldValueMap:this.changes});
        this.closeModal();
    }

    
    handleEdit(event){
        this.loaded = false;
        let name = event.currentTarget.dataset.name;
        getMetadataRecords({metadataApiName: this.metadata.name, extraFields: [{name: "Id"}], limiter:"LIMIT 1",whereq:"DeveloperName  = '"+name+"'"}).then((res) =>{
            this.loaded = true;
            window.open('/'+res[0].details[2], "_blank");
        })
    }

    handleEditChanges(event){
        for (let index = 0; index < this.changes.length; index++) {
            if(this.changes[index].field === event.detail.field){
                this.changes[index].value = event.detail.value;
                return;
            }
        }
        this.changes.push(event.detail);
    }
}