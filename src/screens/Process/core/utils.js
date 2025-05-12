import { collectionScreenNameMap, privateDocTypes } from "../../../core/constants";
import { docType_LabelValueMap, getTaskNatures, privateTaskTypes, taskType_LabelValueMap } from "../../../core/utils";
import { db } from '../../../firebase'

import moment from 'moment';
import 'moment/locale/fr'
import { processModels } from "../models";
moment.locale('fr')

export const configProcessDialogLabels = (choiceId) => {
  switch (choiceId) {
    case 'postpone': return { title: "Motif du repport", description: "Expliquez brièvemment la raison du report." }; break;
    case 'cancel': return { title: "Motif de l'annulation", description: "Expliquez brièvemment la raison de l'annulation." }; break
    case 'block': return { title: "Motif du bloquage", description: "Expliquez brièvemment la raison de ce blocage." }; break
    case 'comment': return { title: "Commentaire", description: "Veuillez saisir votre commentaire." }; break
    default: return { title: "Commentaire", description: "Veuillez saisir votre commentaire." }; break
  }
}

export const isPrivateType = (collection, type) => {
  const privateTypes = collection === "Documents" ? privateDocTypes : (collection === "Agenda" ? privateTaskTypes : "")
  const index = privateTypes.find((t) => t.label === type)
  const isPrivate = index !== -1
  return isPrivate
}

export const buildEntityType = (collection, type) => {

  let typeObject = {}
  if (collection === "Documents") {
    typeObject = {
      label: docType_LabelValueMap(type),
      value: type,
    }
    typeObject = {
      ...typeObject,
      selected: false,
    }
  }

  else if (collection === "Agenda") {
    typeObject = {
      label: taskType_LabelValueMap(type),
      value: type,
    }
    typeObject = {
      ...typeObject,
      natures: getTaskNatures(type)
    }
  }

  return typeObject
}

export const buileNavigationOptions = (currentAction, project) => {
  const { collection, params, documentId } = currentAction;
  const screenName = collectionScreenNameMap[collection];
  const screenPush = collection === "Clients"; // Because already on the nav stack
  let drawer = "";

  let screenParams = {
    isProcess: true,
    project,
    screenPush,
  };

  if (screenName === "UploadDocument") {
    drawer = "DocumentsStack";

    screenParams = {
      ...screenParams,
      DocumentId: documentId || "",
      documentType: buildEntityType(collection, params.documentType),
      dynamicType: isPrivateType(collection, params.documentType),
    };

    if (params.isSignature) {
      screenParams = {
        ...screenParams,
        isSignature: true,
        onSignaturePop: 2,
      };
    }
  } else if (screenName === "CreateTask") {
    drawer = "AgendaStack";

    screenParams = {
      ...screenParams,
      TaskId: documentId || "",
      taskType: buildEntityType(collection, params.taskType),
      dynamicType: isPrivateType(collection, params.taskType),
    };
  } else if (screenName === "Profile") {
    drawer = "ProfileStack";

    screenParams = {
      ...screenParams,
      user: { id: project.client.id, roleId: "client" },
    };
  } else if (screenName === "CreateProject") {
    drawer = "ProjectsStack";

    screenParams = {
      ...screenParams,
      ...params.screenParams,
    };
  }

  return { screenName, screenParams, drawer };
};



export const runOperation = async (operation, action) => {
  if (!operation) return

  const { type, field, value } = operation
  const collection = operation.collection ? operation.collection : action.collection
  const documentId = operation.docId ? operation.docId : action.documentId

  if (type === 'update') {
    let update = {}
    update[field] = value
    await db.collection(collection).doc(documentId).update(update)
  }
}

export const buildValidateActionParams = (onSelectType, choices, choice, nextStep, nextPhase) => {
  if (onSelectType === "transition" || onSelectType === "validation") {
    var params = {
      comment: null,
      choices: null,
      stay: false,
      nextStep,
      nextPhase,
      choice
    }
  }
  else if (onSelectType === "commentPicker") {
    var params = {
      comment: choice.label,
      choices,
      stay: choice.stay,
      nextStep,
      nextPhase
    }
  }
  return params
}


export const handleUpdateAction = (actions, pressedAction, params) => {
  const { comment, choices, stay, nextPhase } = params
  for (let action of actions) {
    if (action.id === pressedAction.id) {
      //Update comment
      if (comment)
        action.comment = comment
      //Update selected choice (selected = true -> Display it green)
      if (choices)
        action.choices = choices
      //Update action status
      if (!stay && nextPhase !== 'cancelProject') {
        action.status = "done"
        action.doneAt = moment().format()
        //set start time of next action
        var index = actions.findIndex(action => action.actionOrder === action.actionOrder + 1)
        if (index !== -1 && !actions[index].startAt)
          actions[index].startAt = moment().format()
      }
    }
  }
  return actions
}

export const setProcessModel = (process) => {
  const { version } = process
  const processModel = processModels[version]
  return processModel
}