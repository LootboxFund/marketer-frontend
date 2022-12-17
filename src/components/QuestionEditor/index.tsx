import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Input } from 'antd';
import { QuestionAnswerID } from '@wormgraph/helpers';
import { QuestionFieldType } from '../../api/graphql/generated/types';
import { Rule } from 'antd/lib/form';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
import Checkbox from 'antd/es/checkbox';
import { $Horizontal, $ColumnGap, $Vertical, $InfoDescription } from '@/components/generics';
import Select from 'antd/es/select';
import Switch from 'antd/es/switch';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export const QuestionTypes = [
  QuestionFieldType.Text,
  QuestionFieldType.Email,
  QuestionFieldType.Phone,
  QuestionFieldType.Address,
  QuestionFieldType.Screenshot,
  QuestionFieldType.Date,
  QuestionFieldType.Link,
  QuestionFieldType.Number,
  QuestionFieldType.SingleSelect,
  QuestionFieldType.MultiSelect,
];

export type QuestionDef = {
  id: QuestionAnswerID;
  question: string;
  type: QuestionFieldType;
  mandatory?: boolean;
  metadata?: string;
};
export type QuestionsEditorProps = {
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
  questions: QuestionDef[];
  pending?: boolean;
  questionsRef: React.MutableRefObject<QuestionEditorState>;
};
export type QuestionEditorState = Record<QuestionAnswerID, QuestionDef>;
const QuestionsEditor: React.FC<QuestionsEditorProps> = ({
  mode,
  pending,
  questions,
  questionsRef,
}) => {
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  const [questionsHash, _setQuestionsHash] = useState<QuestionEditorState>({});
  const setQuestionsHash = (qhash: QuestionEditorState) => {
    _setQuestionsHash(qhash);
    if (questionsRef) {
      questionsRef.current = qhash;
    }
  };
  useEffect(() => {
    if (questions.length === 0) {
      const tempID = uuidv4();
      setQuestionsHash({
        [`new-${tempID}` as QuestionAnswerID]: {
          id: `new-${tempID}` as QuestionAnswerID,
          question: '',
          type: QuestionFieldType.Text,
          mandatory: false,
        },
      });
    } else {
      setQuestionsHash(
        questions.reduce((acc, q) => {
          return { ...acc, [q.id]: q };
        }, {} as Record<QuestionAnswerID, QuestionDef>),
      );
    }
  }, []);
  return (
    <div>
      <$Horizontal justifyContent="space-between">
        <$InfoDescription fontSize="0.9rem">Lorem ipsum</$InfoDescription>
        <Button
          type="ghost"
          onClick={() => {
            const tempID = uuidv4();
            setQuestionsHash({
              ...questionsHash,
              [`new-${tempID}`]: {
                id: `new-${tempID}`,
                question: '',
                type: QuestionFieldType.Text,
                mandatory: false,
                metadata: '',
              },
            });
          }}
        >
          Add Question
        </Button>
      </$Horizontal>
      <br />
      {Object.keys(questionsHash).map((key, i) => {
        const q = questionsHash[key];
        console.log(q);
        return (
          <$Horizontal
            key={`question-${q.id}`}
            alignItems="flex-start"
            style={{ marginBottom: '20px' }}
          >
            <$Vertical style={{ display: 'flex', flex: 4 }}>
              <$Horizontal>
                <Input
                  addonBefore={`Q${i + 1}`}
                  value={questionsHash[key].question}
                  onChange={(e) => {
                    setQuestionsHash({
                      ...questionsHash,
                      [q.id]: {
                        ...questionsHash[q.id],
                        question: e.target.value,
                      },
                    });
                  }}
                  style={{ flex: 3 }}
                />
                <$ColumnGap />
                <Select
                  value={questionsHash[q.id].type}
                  onSelect={(e: any) => {
                    console.log(e);
                    setQuestionsHash({
                      ...questionsHash,
                      [q.id]: {
                        ...questionsHash[q.id],
                        type: e,
                      },
                    });
                  }}
                  defaultValue={QuestionFieldType.Text}
                  style={{ flex: 1 }}
                >
                  {QuestionTypes.map((qt) => (
                    <Select.Option key={`${key}-${qt}`} value={qt}>
                      {qt}
                    </Select.Option>
                  ))}
                </Select>
              </$Horizontal>
              {q.type === QuestionFieldType.MultiSelect ||
              q.type === QuestionFieldType.SingleSelect ? (
                <Input.TextArea
                  rows={2}
                  placeholder={`CSV of options. Include "Other" to allow users to input their own option.
Example: "Option 1, Option 2, Option 3, Other"
                  `}
                  value={q.metadata}
                  onChange={(e) => {
                    setQuestionsHash({
                      ...questionsHash,
                      [q.id]: {
                        ...q,
                        metadata: e.target.value,
                      },
                    });
                  }}
                  style={{
                    marginTop: '5px',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(256,256,256,0.8)',
                  }}
                />
              ) : null}
            </$Vertical>
            <$ColumnGap />

            <$Horizontal
              style={{
                width: '100px',
                minWidth: '100px',
                maxWidth: '100px',
                display: 'flex',
                justifyContent: 'center' /* horizontal align */,
                alignItems: 'center' /* vertical align */,
              }}
            >
              <Switch
                checked={q.mandatory || false}
                onClick={(e: any) => {
                  console.log(e);
                  setQuestionsHash({
                    ...questionsHash,
                    [q.id]: {
                      ...q,
                      mandatory: e,
                    },
                  });
                }}
                checkedChildren="Mandatory"
                unCheckedChildren="Optional"
              />
            </$Horizontal>

            <Button
              type="dashed"
              shape="circle"
              icon={<DeleteOutlined />}
              size="middle"
              onClick={(e) => {
                const newQuestionsHash = { ...questionsHash };
                delete newQuestionsHash[q.id];
                setQuestionsHash(newQuestionsHash);
              }}
            />
          </$Horizontal>
        );
      })}
      <br />
    </div>
  );
};

export default QuestionsEditor;
