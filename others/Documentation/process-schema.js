

const model = {
    phaseId: {
        title: 'Prospect',
        instructions: '',
        phaseOrder: 1,
        followers: ['Admin', 'Directeur commercial', 'Commercial'],
        steps: {
            stepId1: {
                title: 'Création prospect',
                instructions: '',
                stepOrder: 1,
                actions: [
                    {
                        //General
                        id: 'nom',
                        title: 'Nom',
                        instructions: '',
                        actionOrder: 1,
                        responsable: 'Commercial',
                        status: 'pending',
                        //Verification
                        type: 'auto',
                        verificationType: 'data-fill',
                        verificationValue: '',
                        collection: 'Clients',
                        documentId: '', //#dynamic
                        properties: ['nom'],
                        //Navigation
                        screenName: 'Profile',
                        screenParams: { 
                            user: { id: '', roleId: 'client' }, 
                            project: null 
                        },
                        screenPush: true,
                    }
                ]
            }
        }
    }
}



Action:
   //General
   id: 'string',
   title: 'string',
   instructions: 'string',
   actionOrder: 1,
   responsable: 'Commercial',
   status: 'pending',
   //Verification
   type: 'auto' || 'manual',
   verificationType: 'data-fill' || 'doc-creation' || 'multiple-choices' || 'validation',
   verificationValue: '' || bool, //ONLY when verificationType = "data-fill"
   properties: ['property'], //ONLY when verificationType = "data-fill"
   collection: 'Clients' || "Documents" || "Projects" || "Agenda",
   documentId: 'ClientId' || "DocumentId" || "ProjectId" || "TaskId", //dynamic: (DocumentId, TaskId), static (ClientId, ProjectId)
   //Navigation
   screenName: 'Profile' || "UploadDocument" || "CreateProject" || "Createtask",
   screenParams: { 
       user: { id: '', roleId: 'client' }, //#static ONLY when screenName = "Profile" 
       project: null, //#static always (could be taken directly from ProcessAction !! should remove it from model),
       
       taskType: { //ONLY when screenName= "CreateTask"
        label: 'Installation',
        value: 'Installation',
        natures: ['tech'],
      },
      dynamicType: true,
      TaskId: "TaskId" //ONLY when screenName= "CreateTask" & is Edit task

      documentType: { //ONLY when screenName= "UploadDocument"
        label: 'PV réception',
        value: 'PV réception',
        selected: false,
      },
      dynamicType: true, 
      DocumentId: '', //ONLY when screenName= "UploadDocument" & is Edit task (signature)
      onSignaturePop: 2, //ONLY on signature action
      isSignature: true, //ONLY on signature action

      sections: { info: { projectWorkTypes: true } }, //updating a specific data (currently adapted to CreateProject UI only)
   },
   screenPush: true,
   