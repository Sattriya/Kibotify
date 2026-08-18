import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Music } from 'lucide-react'
import SongsTable from './SongsTable'
import AddSongDialog from './AddSongDialog'

const SongsTabContent = () => {
  return (
    <Card >
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Music className='text-emerald-500 size-5' />
              Songs Library
            </CardTitle>
            <CardDescription>
              Manage Your Music, Kibot!
            </CardDescription>
          </div>
          <AddSongDialog/>
        </div>
      </CardHeader>
      <CardContent>
        <SongsTable />
      </CardContent>
    </Card>
  )
}

export default SongsTabContent
