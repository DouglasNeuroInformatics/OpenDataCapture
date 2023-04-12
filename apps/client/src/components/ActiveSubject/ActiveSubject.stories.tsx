import React from 'react';

import { DateUtils } from '@ddcp/common';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../Button';

import { ActiveSubject } from './ActiveSubject';

import { useActiveSubjectStore } from '@/stores/active-subject-store';

type Story = StoryObj<typeof ActiveSubject>;

export default {
  component: ActiveSubject,
  decorators: [
    (Story) => {
      const { setActiveSubject } = useActiveSubjectStore();
      return (
        <div className="container">
          <Story />
          <div>
            <h1 className="mb-5 text-3xl font-bold">Example Page</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore placeat quia dolores aspernatur laudantium
              quaerat voluptatum maiores excepturi, tenetur eos, sed, ducimus iste exercitationem mollitia odit?
              Delectus at laborum maxime, inventore saepe ipsam pariatur aliquam, provident exercitationem optio
              reiciendis hic, quo nulla ducimus dolores repellendus! Maxime obcaecati, aperiam quos delectus explicabo
              asperiores cum quas recusandae, laborum in, optio ut ipsum. Illo magni excepturi ratione asperiores nihil
              quam earum at nam eveniet maiores, eligendi quisquam suscipit, repellendus odio doloremque error veniam!
              Incidunt iste expedita ab temporibus cupiditate minima laborum vitae, deserunt ipsa repellat. Error ut
              consequuntur veritatis. Eum sed exercitationem nisi iste unde ratione beatae consectetur nobis in dolor
              ipsam totam laborum minus aspernatur, excepturi adipisci cumque repellendus repudiandae sint? Nam officiis
              consequatur voluptas exercitationem, tempore eos perspiciatis atque, fugiat hic sed beatae ullam minima
              quam dolor debitis. Dolor itaque fugit facere optio sit. Beatae vitae voluptas nihil earum placeat dicta
              cupiditate esse deserunt. Hic maiores cumque voluptatibus accusantium eligendi suscipit sapiente
              laudantium, quisquam temporibus natus deleniti voluptatum nam in eum veritatis eos odit iste animi. Sunt
              unde repellendus non asperiores blanditiis. Officiis, nulla aut. Pariatur atque rerum labore saepe
              officia. Distinctio corrupti iure ab nemo nihil quo veniam voluptate deleniti!
            </p>
            <Button
              className="my-5"
              label="Reset Active Subject"
              onClick={() => {
                setActiveSubject({
                  firstName: 'John',
                  lastName: 'Smith',
                  dateOfBirth: DateUtils.toBasicISOString(new Date()),
                  sex: 'male'
                });
              }}
            />
          </div>
        </div>
      );
    }
  ]
} as Meta<typeof ActiveSubject>;

export const Default: Story = {};
