{
  "nodes": [
    {
      "parameters": {},
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        100,
        20
      ],
      "id": "16517ee3-fafb-458a-9e06-705f44de319e",
      "name": "Supabase",
      "credentials": {
        "supabaseApi": {
          "id": "DPqY5RUMhicaMQcD",
          "name": "Supabase account 2"
        }
      },
      "disabled": true
    },
    {
      "parameters": {
        "content": "## Dispara Mensagem\n** Envia mensagem com base no usuário que está selecionando",
        "height": 300,
        "width": 700
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -160,
        -100
      ],
      "typeVersion": 1,
      "id": "a5b11850-9500-4320-ad99-2c56b51499e3",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "e59f314f-d993-40f4-8905-b9a4fd89fbbe",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [
        -120,
        20
      ],
      "id": "51eb18ab-c89f-465f-a1c3-0283ebeb66fa",
      "name": "Recebe https",
      "webhookId": "e59f314f-d993-40f4-8905-b9a4fd89fbbe"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "baeb0df0-2550-4327-b262-ff093a0e62f1",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [
        -120,
        420
      ],
      "id": "5abc538f-61e2-4edc-82da-570c05f7e91c",
      "name": "Webhook",
      "webhookId": "baeb0df0-2550-4327-b262-ff093a0e62f1"
    },
    {
      "parameters": {
        "content": "## Recebe Mensagens e Atualiza no Supabase\n** Atualiza no Supabase",
        "height": 300,
        "width": 920
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -160,
        280
      ],
      "typeVersion": 1,
      "id": "a943ab7b-5772-4991-8c70-e960821c2b06",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "f04df543-3d21-4a01-9946-83d45514d11c",
              "name": "content",
              "value": "={{ $json.body.data.message.conversation }}",
              "type": "string"
            },
            {
              "id": "9a1431f4-7837-4c01-ac65-b22f530d2eb4",
              "name": "sender",
              "value": "={{ $json.body.data.key.fromMe }}",
              "type": "string"
            },
            {
              "id": "50a2ce70-4e90-4dee-ad1d-4f5a1516ead3",
              "name": "sent_at",
              "value": "={{ $json.body.data.message.messageContextInfo.deviceListMetadata.recipientTimestamp }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        20,
        620
      ],
      "id": "184c31e9-9ac3-4360-a0b9-b47293a66db6",
      "name": "Edit Fields",
      "disabled": true
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "1838f3b1-3b8a-4433-8ab7-c7dbe6da5998",
              "name": "customer_phone",
              "value": "={{ $json.body.data.key.remoteJid }}",
              "type": "string"
            },
            {
              "id": "9e83b62a-5d41-4c47-847e-2b89387a9aa7",
              "name": "message_content",
              "value": "={{ $json.body.data.message.conversation }}",
              "type": "string"
            },
            {
              "id": "9568f7e2-fb1e-492a-a220-855402a4a0e3",
              "name": "message_timestamp",
              "value": "={{ $json.body.data.messageTimestamp }}",
              "type": "string"
            },
            {
              "id": "4e630358-5596-45a9-ab7f-44078aec61ae",
              "name": "instance_name",
              "value": "={{ $json.body.instance }}",
              "type": "string"
            },
            {
              "id": "09dc216a-6e99-4539-aa05-fbba6a7c6017",
              "name": "name",
              "value": "={{ $json.body.data.pushName }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        320,
        420
      ],
      "id": "d2a63688-2c19-4267-a171-b89a800fbc57",
      "name": "Variáveis",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "5d38efa4-8a30-49d1-b709-e23625f12885",
              "leftValue": "={{ $json.name }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "exists",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1260,
        420
      ],
      "id": "a14c1374-fd74-4250-9fb4-c2c3e47367fe",
      "name": "If"
    },
    {
      "parameters": {
        "operation": "get",
        "tableId": "clients",
        "filters": {
          "conditions": [
            {
              "keyName": "phone",
              "keyValue": "={{ $('Variáveis').item.json.customer_phone.replace(/\\D/g, '') }}"
            },
            {
              "keyName": "created_by",
              "keyValue": "={{ $json.user_id }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        1040,
        420
      ],
      "id": "e34accc2-4f09-48a3-84f0-9b1adc67fd53",
      "name": "Compara Whatsapp se já está nos contatos",
      "alwaysOutputData": true,
      "executeOnce": false,
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "a2b43bca-c0b0-4b56-968b-500271ff456d",
              "name": "user_id",
              "value": "={{ $json.user_id }}",
              "type": "string"
            },
            {
              "id": "6fe54552-61a4-4140-a796-4579572e9c4d",
              "name": "id",
              "value": "={{ $json.id }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        760,
        420
      ],
      "id": "3803c4e3-edb9-4cbd-8578-46efea8fcb3a",
      "name": "Variáveis 2",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "tableId": "clients",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "name",
              "fieldValue": "={{ $('Variáveis').item.json.name }}"
            },
            {
              "fieldId": "phone",
              "fieldValue": "={{ $('Variáveis').item.json.customer_phone.replace(/\\D/g, '') }}"
            },
            {
              "fieldId": "created_by",
              "fieldValue": "={{ $('Variáveis 2').item.json.user_id }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        1260,
        580
      ],
      "id": "5e6c7ccf-125d-4baa-94d9-0af95880ab12",
      "name": "Cria o contato",
      "alwaysOutputData": true,
      "executeOnce": false,
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.1,
      "position": [
        1540,
        480
      ],
      "id": "5b7d136d-45ad-48df-97ac-ef40b729a2e5",
      "name": "Merge",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "481b57db-ad7b-42c4-8fef-c976a7376a7f",
              "leftValue": "={{ $json.id }}",
              "rightValue": "",
              "operator": {
                "type": "string",
                "operation": "exists",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        2080,
        480
      ],
      "id": "e74a988d-d48a-40b5-a111-7c73e61305fd",
      "name": "Existe Conversa?",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "operation": "get",
        "tableId": "conversations",
        "filters": {
          "conditions": [
            {
              "keyName": "client_id",
              "keyValue": "={{ $json.id }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        1860,
        480
      ],
      "id": "cb9e3970-34b5-4218-9014-c71edc3ad044",
      "name": "Encontrar a Conversa Ativa",
      "alwaysOutputData": true,
      "executeOnce": false,
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {
        "tableId": "conversations",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "client_id",
              "fieldValue": "={{ $('Merge').item.json.id }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "=active"
            },
            {
              "fieldId": "last_message_at",
              "fieldValue": "={{ $('Webhook').item.json.body.date_time }}"
            },
            {
              "fieldId": "assigned_to",
              "fieldValue": "={{ $('Variáveis 2').item.json.user_id }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        2100,
        660
      ],
      "id": "acf05fd4-c223-4558-833d-cbd4f9e7d221",
      "name": "Criar nova Conversa",
      "alwaysOutputData": true,
      "executeOnce": false,
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.1,
      "position": [
        2360,
        560
      ],
      "id": "2998b5aa-f8f9-4a9c-876c-df65d096d3fd",
      "name": "Merge1",
      "alwaysOutputData": true
    },
    {
      "parameters": {
        "operation": "get",
        "tableId": "settings",
        "filters": {
          "conditions": [
            {
              "keyName": "evolution_instance_name",
              "keyValue": "={{ $json.instance_name }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        520,
        420
      ],
      "id": "dc7754eb-3299-48c8-aaed-983c21140803",
      "name": "Compara Instância e busca ID",
      "alwaysOutputData": false,
      "executeOnce": false,
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {
        "tableId": "messages",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "conversation_id",
              "fieldValue": "={{ $json.id }}"
            },
            {
              "fieldId": "content",
              "fieldValue": "={{ $('Variáveis').item.json.message_content }}"
            },
            {
              "fieldId": "sender",
              "fieldValue": "client"
            },
            {
              "fieldId": "sent_at",
              "fieldValue": "={{ new Date($('Variáveis').item.json.message_timestamp * 1000).toISOString() }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        2600,
        560
      ],
      "id": "ccd359dc-1c2a-41fc-a806-576cafd49156",
      "name": "Supabase1",
      "credentials": {
        "supabaseApi": {
          "id": "gIFvKlw1cPfUxRqs",
          "name": "Erick"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "f24364c1-62ab-45d6-8c4d-0a795675638d",
              "leftValue": "={{ $json.body.data.key.fromMe }}",
              "rightValue": "",
              "operator": {
                "type": "boolean",
                "operation": "false",
                "singleValue": true
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        120,
        420
      ],
      "id": "ab62e8f5-9568-49a9-9a09-d49033c674d6",
      "name": "If1"
    }
  ],
  "connections": {
    "Recebe https": {
      "main": [
        [
          {
            "node": "Supabase",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook": {
      "main": [
        [
          {
            "node": "If1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Variáveis": {
      "main": [
        [
          {
            "node": "Compara Instância e busca ID",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Cria o contato",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Compara Whatsapp se já está nos contatos": {
      "main": [
        [
          {
            "node": "If",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Variáveis 2": {
      "main": [
        [
          {
            "node": "Compara Whatsapp se já está nos contatos",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Cria o contato": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Encontrar a Conversa Ativa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Existe Conversa?": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Criar nova Conversa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Encontrar a Conversa Ativa": {
      "main": [
        [
          {
            "node": "Existe Conversa?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Criar nova Conversa": {
      "main": [
        [
          {
            "node": "Merge1",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Merge1": {
      "main": [
        [
          {
            "node": "Supabase1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Compara Instância e busca ID": {
      "main": [
        [
          {
            "node": "Variáveis 2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If1": {
      "main": [
        [
          {
            "node": "Variáveis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Webhook": [
      {
        "headers": {
          "host": "api.codegrana.com.br",
          "user-agent": "axios/1.7.9",
          "content-length": "921",
          "accept-encoding": "gzip, compress, deflate, br",
          "content-type": "application/json",
          "x-forwarded-for": "172.18.0.1",
          "x-forwarded-host": "api.codegrana.com.br",
          "x-forwarded-port": "443",
          "x-forwarded-proto": "https",
          "x-forwarded-server": "ac27b2472660",
          "x-real-ip": "172.18.0.1"
        },
        "params": {},
        "query": {},
        "body": {
          "event": "messages.upsert",
          "instance": "caldasIA",
          "data": {
            "key": {
              "remoteJid": "556481140676@s.whatsapp.net",
              "fromMe": false,
              "id": "782647C0073AA0039110EB72593C4AC5"
            },
            "pushName": "Mayssa Ferreira",
            "status": "DELIVERY_ACK",
            "message": {
              "conversation": "Oii",
              "messageContextInfo": {
                "deviceListMetadata": {
                  "senderKeyHash": "XKYKdjbqZ8zehQ==",
                  "senderTimestamp": "1749746573",
                  "recipientKeyHash": "VC3OS44aI2oaqA==",
                  "recipientTimestamp": "1750197727"
                },
                "deviceListMetadataVersion": 2,
                "messageSecret": "JSnojSc0KPCLC6UuU4Eh6g+9WWDcbtDUKmJThpI8oeQ="
              }
            },
            "messageType": "conversation",
            "messageTimestamp": 1750876007,
            "instanceId": "f86c8b02-29df-4de1-ac9d-1e8c78d7475c",
            "source": "android"
          },
          "destination": "https://api.codegrana.com.br/webhook/baeb0df0-2550-4327-b262-ff093a0e62f1",
          "date_time": "2025-06-25T15:26:47.781Z",
          "sender": "556492469875@s.whatsapp.net",
          "server_url": "https://evolution.codegrana.com.br",
          "apikey": "493ED0BEB1A8-47F2-A6EE-731DBFDB99D2"
        },
        "webhookUrl": "https://api.codegrana.com.br/webhook/baeb0df0-2550-4327-b262-ff093a0e62f1",
        "executionMode": "production"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "8894988a030618df1e9468cc6c102e41aeff45e4ba811d32f8f4d2c6a2eacf60"
  }
}