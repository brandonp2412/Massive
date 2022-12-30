import 'react-native'
import React from 'react'
import {render} from 'react-native-testing-library'
import HomePage from '../HomePage'
import {NavigationContainer} from '@react-navigation/native'
import {Provider} from 'react-native-paper'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import SetList from '../SetList'
import {Text} from 'react-native'
import {AppDataSource} from '../data-source'

jest.mock('typeorm', () => ({
  createConnection: jest.fn(() => ({
    close: jest.fn(),
  })),
  Entity: (name: string) => {
    return (target: any) => {
      target.name = name
    }
  },
  Column: (type: any) => {
    return (target: any, propertyName: string) => {
      target.columns = target.columns || []
      target.columns.push({
        propertyName,
        type,
      })
    }
  },
  PrimaryColumn: () => {
    return (target: any, propertyName: string) => {
      target.primaryColumn = {
        propertyName,
      }
    }
  },
  PrimaryGeneratedColumn: () => {
    return (target: any, propertyName: string) => {
      target.primaryColumn = {
        propertyName,
      }
    }
  },
}))

describe('HomePage', () => {
  it('renders correctly', async () => {
    const {getByText} = render(
      <Provider settings={{icon: props => <MaterialIcon {...props} />}}>
        <NavigationContainer>
          <SetList />
        </NavigationContainer>
      </Provider>,
    )
    expect(getByText('Home')).toBeDefined()
  })
})
